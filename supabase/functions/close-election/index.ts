// supabase/functions/close-election/index.ts
// Commissioner only: closes election, computes audit log integrity hash
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { election_id } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verify caller is commissioner or admin
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  const { data: student } = await supabase
    .from('students').select('role').eq('id', user?.id ?? '').single()

  if (!student || !['commissioner','admin'].includes(student.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  // Fetch all audit log records for this election, ordered by created_at
  const { data: logs } = await supabase
    .from('audit_log')
    .select('*')
    .eq('election_id', election_id)
    .order('created_at', { ascending: true })

  // Compute SHA-256 over the full serialised audit log
  const encoder = new TextEncoder()
  const logJson = JSON.stringify(logs)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(logJson))
  const audit_log_hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // Update election status and store hash
  await supabase.from('elections').update({
    status: 'closed',
    audit_log_hash,
  }).eq('id', election_id)

  // Audit log: record the close event
  await supabase.from('audit_log').insert({
    event_type: 'election_closed',
    election_id,
    actor_id: user?.id,
    details: { audit_log_hash },
  })

  return new Response(JSON.stringify({ success: true, audit_log_hash }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
