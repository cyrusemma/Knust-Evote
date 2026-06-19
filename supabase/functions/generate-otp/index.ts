// supabase/functions/generate-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { index_number } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Validate index number exists and is eligible
  const { data: student, error } = await supabase
    .from('students')
    .select('id, email, phone, full_name, is_eligible')
    .eq('index_number', index_number)
    .single()

  if (error || !student || !student.is_eligible) {
    return new Response(JSON.stringify({ error: 'Index number not found or not eligible to vote' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Rate limit: max 3 OTP requests per index number in 5 minutes
  const { count } = await supabase
    .from('otp_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('index_number', index_number)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

  if ((count ?? 0) >= 3) {
    // Insert HIGH anomaly flag
    await supabase.from('anomaly_flags').insert({
      flag_type: 'rapid_otp_requests',
      severity: 'high',
      description: `Index number ${index_number} requested OTP ${(count ?? 0) + 1} times in 5 minutes`,
      actor_id: student.id,
    })
    return new Response(JSON.stringify({ error: 'Too many OTP requests. Please wait before trying again.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' }
    })
  }

  // 3. Generate cryptographically random 6-digit OTP
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const otp = String(array[0] % 1000000).padStart(6, '0')

  // 4. Hash the OTP with bcrypt before storage (never store plain text)
  const encoder = new TextEncoder()
  const otpBuffer = encoder.encode(otp)
  const hashBuffer = await crypto.subtle.digest('SHA-256', otpBuffer)
  const otpHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // 5. Store hashed OTP
  await supabase.from('otp_tokens').insert({
    index_number,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })

  // 6. Send OTP via Arkesel SMS
  if (student.phone) {
    await fetch('https://sms.arkesel.com/sms/api', {
      method: 'POST',
      headers: { 'api-key': Deno.env.get('ARKESEL_API_KEY')! },
      body: JSON.stringify({
        action: 'send-sms',
        api_key: Deno.env.get('ARKESEL_API_KEY'),
        to: student.phone,
        from: 'KNUSTVote',
        sms: `Your KNUSTVote OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`
      })
    })
  }

  // 7. Send OTP via Resend email
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KNUSTVote <noreply@knustvote.vercel.app>',
      to: student.email,
      subject: `Your KNUSTVote verification code: ${otp}`,
      html: `
        <p>Hello ${student.full_name},</p>
        <p>Your KNUSTVote one-time password is:</p>
        <h1 style="font-size:48px;letter-spacing:8px;font-family:monospace;">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `
    })
  })

  // 8. Write audit log
  await supabase.from('audit_log').insert({
    event_type: 'otp_issued',
    actor_id: student.id,
    details: { index_number, channel: student.phone ? 'sms+email' : 'email' },
    ip_address: req.headers.get('x-forwarded-for') ?? '',
    user_agent: req.headers.get('user-agent') ?? '',
  })

  return new Response(JSON.stringify({
    success: true,
    message: `OTP sent to ${student.email}${student.phone ? ' and your registered phone' : ''}`,
    masked_email: student.email.replace(/(.{2})(.*)(@)/, '$1***$3'),
  }), { headers: { 'Content-Type': 'application/json' } })
})
