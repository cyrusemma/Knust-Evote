// supabase/functions/submit-vote/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { election_id, candidate_id, idempotency_key } = await req.json()

  // Get the authenticated user from JWT
  const authHeader = req.headers.get('Authorization')!
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const voter_id = user.id
  const SERVER_SALT = Deno.env.get('SERVER_SECRET_SALT')!

  // 1. Idempotency: check if this key was already used
  const { data: existingVote } = await supabase
    .from('votes')
    .select('ballot_hash')
    .eq('idempotency_key', idempotency_key)
    .single()

  if (existingVote) {
    // Return the original receipt — idempotent
    return new Response(JSON.stringify({
      success: true,
      ballot_hash: existingVote.ballot_hash,
      already_submitted: true,
    }), { headers: { 'Content-Type': 'application/json' } })
  }

  // 2. Compute anonymised voter token
  const encoder = new TextEncoder()
  const tokenInput = `${voter_id}${election_id}${SERVER_SALT}`
  const tokenBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(tokenInput))
  const voter_token = Array.from(new Uint8Array(tokenBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // 3. Check if voter_token already voted in this election (belt-and-suspenders)
  const { data: duplicateVote } = await supabase
    .from('votes')
    .select('id')
    .eq('voter_token', voter_token)
    .eq('election_id', election_id)
    .single()

  if (duplicateVote) {
    await supabase.from('audit_log').insert({
      event_type: 'vote_duplicate_blocked',
      election_id,
      actor_id: voter_id,
      details: { reason: 'voter_token_already_voted' },
      ip_address: req.headers.get('x-forwarded-for') ?? '',
    })
    return new Response(JSON.stringify({ error: 'You have already voted in this election' }), { status: 409 })
  }

  // 4. Verify election is open
  const { data: election } = await supabase
    .from('elections')
    .select('status, end_time')
    .eq('id', election_id)
    .single()

  if (!election || election.status !== 'open' || new Date(election.end_time) < new Date()) {
    return new Response(JSON.stringify({ error: 'Election is not currently open' }), { status: 400 })
  }

  // 5. Compute ballot hash (receipt returned to voter)
  const timestamp = new Date().toISOString()
  const hashInput = `${voter_token}${election_id}${candidate_id}${timestamp}${SERVER_SALT}`
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashInput))
  const ballot_hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // 6. Insert vote (DB unique constraint is the final guard)
  const { error: insertError } = await supabase.from('votes').insert({
    election_id,
    voter_token,
    candidate_id,
    ballot_hash,
    idempotency_key,
    submitted_at: timestamp,
  })

  if (insertError) {
    // Unique constraint violation = duplicate
    if (insertError.code === '23505') {
      return new Response(JSON.stringify({ error: 'You have already voted in this election' }), { status: 409 })
    }
    throw insertError
  }

  // 7. Audit log
  await supabase.from('audit_log').insert({
    event_type: 'vote_submitted',
    election_id,
    actor_id: voter_id,
    details: { candidate_id, ballot_hash },
    ip_address: req.headers.get('x-forwarded-for') ?? '',
  })

  // 8. Run anomaly check (bot-speed: was OTP verified less than 30s ago?)
  const { data: recentOtpEvent } = await supabase
    .from('audit_log')
    .select('created_at')
    .eq('actor_id', voter_id)
    .eq('event_type', 'otp_verified')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (recentOtpEvent) {
    const secondsSinceOtp = (Date.now() - new Date(recentOtpEvent.created_at).getTime()) / 1000
    if (secondsSinceOtp < 30) {
      await supabase.from('anomaly_flags').insert({
        election_id,
        flag_type: 'bot_speed_vote',
        severity: 'medium',
        description: `Vote submitted ${secondsSinceOtp.toFixed(1)}s after OTP verification (threshold: 30s)`,
        actor_id: voter_id,
        ip_address: req.headers.get('x-forwarded-for') ?? '',
      })
    }
  }

  return new Response(JSON.stringify({
    success: true,
    ballot_hash,
  }), { headers: { 'Content-Type': 'application/json' } })
})
