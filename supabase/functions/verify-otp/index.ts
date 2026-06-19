// supabase/functions/verify-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { index_number, otp } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: student } = await supabase
    .from('students')
    .select('id, email, role')
    .eq('index_number', index_number)
    .single()

  if (!student) {
    return new Response(JSON.stringify({ error: 'Invalid index number' }), { status: 401 })
  }

  // Hash the submitted OTP the same way
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otp))
  const submittedHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // Find a matching, unused, unexpired OTP for this index number
  const { data: token } = await supabase
    .from('otp_tokens')
    .select('id, otp_hash, expires_at, is_used')
    .eq('index_number', index_number)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!token || token.otp_hash !== submittedHash) {
    await supabase.from('audit_log').insert({
      event_type: 'otp_failed',
      actor_id: student.id,
      details: { reason: token ? 'hash_mismatch' : 'no_valid_token' },
      ip_address: req.headers.get('x-forwarded-for') ?? '',
    })
    return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), { status: 401 })
  }

  // Mark token as used
  await supabase.from('otp_tokens').update({ is_used: true }).eq('id', token.id)

  // Sign the user in via Supabase Auth magic link approach
  // Generate a short-lived session using admin signInWithPassword
  // For the prototype: use Supabase service role to create a custom session
  const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: student.email,
  })

  // Write success audit log
  await supabase.from('audit_log').insert({
    event_type: 'otp_verified',
    actor_id: student.id,
    details: { index_number },
    ip_address: req.headers.get('x-forwarded-for') ?? '',
  })

  return new Response(JSON.stringify({
    success: true,
    student_id: student.id,
    role: student.role,
    // Return the magic link token for the client to exchange for a session
    action_link: authData?.properties?.action_link,
  }), { headers: { 'Content-Type': 'application/json' } })
})
