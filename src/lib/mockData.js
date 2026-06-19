// Central simulation store — all mock data lives here.
// Changes persist in localStorage so they survive page refreshes.

const STORAGE_KEY = 'knustvote_sim';

const defaultData = {
  elections: [
    {
      id: 'e1',
      title: 'SRC Presidential Election 2025/2026',
      description: 'Annual Student Representative Council Presidential Election.',
      status: 'open',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date(Date.now() + 82800000).toISOString(),
      created_by: '0000001',
      results_published_at: null,
      audit_log_hash: null,
      vote_order: 1, // determines the order in the multi-position queue
    },
    {
      id: 'e2',
      title: 'Hall of Fame Prefect Election',
      description: 'Election for the Hall of Fame Prefect position.',
      status: 'open',
      start_time: new Date(Date.now() - 7200000).toISOString(),
      end_time: new Date(Date.now() + 50400000).toISOString(),
      created_by: '0000001',
      results_published_at: null,
      audit_log_hash: null,
      vote_order: 2,
    },
    {
      id: 'e3',
      title: 'SRC Women\'s Commissioner Election',
      description: 'Closed election for the Women\'s Commissioner seat.',
      status: 'closed',
      start_time: new Date(Date.now() - 172800000).toISOString(),
      end_time: new Date(Date.now() - 86400000).toISOString(),
      created_by: '0000001',
      results_published_at: new Date(Date.now() - 82800000).toISOString(),
      audit_log_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      vote_order: 3,
    },
    {
      id: 'e4',
      title: 'SRC General Secretary (Uncontested)',
      description: 'Confidence vote for the uncontested SRC General Secretary candidate.',
      status: 'open',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date(Date.now() + 82800000).toISOString(),
      created_by: '0000001',
      results_published_at: null,
      audit_log_hash: null,
      vote_order: 3,
    },
  ],
  candidates: [
    // SRC Presidential
    { id: 'c1', election_id: 'e1', full_name: 'Kwame Mensah', position_title: 'SRC President', manifesto: 'I will champion academic excellence, mental health support, and transparent student governance.', initials: 'KM', color: '#1A3A6B', vote_count: 512, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    { id: 'c2', election_id: 'e1', full_name: 'Akosua Agyemang', position_title: 'SRC President', manifesto: 'My vision is a connected student body with improved campus infrastructure and inclusive welfare programs.', initials: 'AA', color: '#B8860B', vote_count: 450, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    { id: 'c3', election_id: 'e1', full_name: 'Emmanuel Boateng', position_title: 'SRC President', manifesto: 'Technology-driven governance, better hostels, and a strong alumni network for career opportunities.', initials: 'EB', color: '#16A34A', vote_count: 238, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    
    // Hall of Fame Prefect
    { id: 'c4', election_id: 'e2', full_name: 'Abena Osei-Bonsu', position_title: 'Hall Prefect', manifesto: 'A cleaner, safer, and more vibrant hall experience for all residents.', initials: 'AO', color: '#7C3AED', vote_count: 180, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    { id: 'c5', election_id: 'e2', full_name: 'Kofi Asante-Afriyie', position_title: 'Hall Prefect', manifesto: 'Building community spirit through regular events, better facilities, and student welfare.', initials: 'KA', color: '#DC2626', vote_count: 210, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    
    // Women's Commissioner
    { id: 'c6', election_id: 'e3', full_name: 'Ama Serwaa Kyei', position_title: "Women's Commissioner", manifesto: 'Empowering women students through mentorship, welfare, and advocacy.', initials: 'AS', color: '#1A3A6B', vote_count: 650, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },
    { id: 'c7', election_id: 'e3', full_name: 'Adjoa Mensah-Boateng', position_title: "Women's Commissioner", manifesto: 'Safe spaces, career development, and gender equality on campus.', initials: 'AM', color: '#B8860B', vote_count: 340, is_approved: true, is_unopposed: false, yes_votes: 0, no_votes: 0 },

    // Uncontested General Secretary
    { id: 'c8', election_id: 'e4', full_name: 'Daniel Kwarteng-Acheampong', position_title: 'General Secretary', manifesto: 'I will bring transparency, efficiency, and digital record-keeping to SRC administration.', initials: 'DK', color: '#1A3A6B', vote_count: 0, is_approved: true, is_unopposed: true, yes_votes: 180, no_votes: 45 },
  ],
  votes: [], // { election_id, candidate_id, voter_index, ballot_hash, vote_value? (yes/no for unopposed) }
  anomaly_flags: [
    { id: 'f1', election_id: 'e1', severity: 'high', flag_type: 'rapid_otp_requests', description: 'Index 1000005 requested OTP 4 times in 5 minutes', created_at: new Date(Date.now() - 600000).toISOString(), is_dismissed: false },
    { id: 'f2', election_id: 'e1', severity: 'medium', flag_type: 'bot_speed_vote', description: 'Vote submitted 12.4s after OTP verification (threshold: 30s)', created_at: new Date(Date.now() - 300000).toISOString(), is_dismissed: false },
  ],
  audit_log: [
    { id: 'a1', election_id: 'e1', event_type: 'election_opened', actor_id: '0000001', created_at: new Date(Date.now() - 3600000).toISOString(), details: {} },
    { id: 'a2', election_id: 'e1', event_type: 'otp_issued', actor_id: '1000001', created_at: new Date(Date.now() - 1800000).toISOString(), details: { channel: 'sms+email' } },
    { id: 'a3', election_id: 'e1', event_type: 'otp_verified', actor_id: '1000001', created_at: new Date(Date.now() - 1790000).toISOString(), details: {} },
    { id: 'a4', election_id: 'e1', event_type: 'vote_submitted', actor_id: '1000001', created_at: new Date(Date.now() - 1780000).toISOString(), details: { ballot_hash: 'abc123...' } },
    { id: 'a5', election_id: 'e1', event_type: 'anomaly_flagged', actor_id: '1000005', created_at: new Date(Date.now() - 600000).toISOString(), details: { flag_type: 'rapid_otp_requests' } },
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultData));
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStore() { return load(); }
export function resetStore() { localStorage.removeItem(STORAGE_KEY); }

// ─── Elections ───────────────────────────────────────────────────────────────
export function getElections() { return load().elections; }
export function getElection(id) { return load().elections.find(e => e.id === id); }
export function createElection(data) {
  const store = load();
  const order = store.elections.length + 1;
  const election = { id: `e${Date.now()}`, ...data, created_by: '0000001', results_published_at: null, audit_log_hash: null, vote_order: order };
  store.elections.push(election);
  store.audit_log.push({ id: `a${Date.now()}`, election_id: election.id, event_type: 'election_created', actor_id: '0000001', created_at: new Date().toISOString(), details: {} });
  save(store);
  return election;
}
export function updateElection(id, data) {
  const store = load();
  const idx = store.elections.findIndex(e => e.id === id);
  if (idx !== -1) store.elections[idx] = { ...store.elections[idx], ...data };
  save(store);
}
export function closeElection(id) {
  const hash = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  updateElection(id, { status: 'closed', audit_log_hash: hash, results_published_at: new Date().toISOString() });
  const store = load();
  store.audit_log.push({ id: `a${Date.now()}`, election_id: id, event_type: 'election_closed', actor_id: '0000001', created_at: new Date().toISOString(), details: { audit_log_hash: hash } });
  save(store);
  return hash;
}

// ─── Candidates ──────────────────────────────────────────────────────────────
const COLORS = ['#1A3A6B','#B8860B','#16A34A','#DC2626','#7C3AED','#D97706','#059669','#2563EB'];
export function getCandidates(electionId) { return load().candidates.filter(c => c.election_id === electionId && c.is_approved); }
export function getAllCandidates(electionId) { return load().candidates.filter(c => c.election_id === electionId); }
export function addCandidate(data) {
  const store = load();
  const idx = store.candidates.filter(c => c.election_id === data.election_id).length;
  const candidate = {
    id: `c${Date.now()}`,
    ...data,
    initials: data.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    color: COLORS[idx % COLORS.length],
    vote_count: 0,
    is_approved: true,
    is_unopposed: data.is_unopposed || false,
    yes_votes: 0,
    no_votes: 0,
  };
  store.candidates.push(candidate);
  save(store);
  return candidate;
}
export function updateCandidate(id, data) {
  const store = load();
  const idx = store.candidates.findIndex(c => c.id === id);
  if (idx !== -1) store.candidates[idx] = { ...store.candidates[idx], ...data };
  save(store);
}
export function deleteCandidate(id) {
  const store = load();
  store.candidates = store.candidates.filter(c => c.id !== id);
  save(store);
}
// Check if election is in unopposed mode (only 1 candidate who is marked unopposed)
export function isElectionUnopposed(electionId) {
  const candidates = load().candidates.filter(c => c.election_id === electionId && c.is_approved);
  return candidates.length === 1 && candidates[0].is_unopposed;
}

// ─── Votes ───────────────────────────────────────────────────────────────────
export function hasVoted(electionId, voterIndex) {
  return load().votes.some(v => v.election_id === electionId && v.voter_index === voterIndex);
}
export function getVoteReceipt(electionId, voterIndex) {
  return load().votes.find(v => v.election_id === electionId && v.voter_index === voterIndex);
}
export function getAllVotes() { return load().votes; }

export function submitVote(electionId, candidateId, voterIndex) {
  const store = load();
  if (store.votes.some(v => v.election_id === electionId && v.voter_index === voterIndex)) {
    throw new Error('You have already voted in this election');
  }
  const ballotHash = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  store.votes.push({ election_id: electionId, candidate_id: candidateId, voter_index: voterIndex, ballot_hash: ballotHash, submitted_at: new Date().toISOString() });
  const cIdx = store.candidates.findIndex(c => c.id === candidateId);
  if (cIdx !== -1) store.candidates[cIdx].vote_count++;
  store.audit_log.push({ id: `a${Date.now()}`, election_id: electionId, event_type: 'vote_submitted', actor_id: voterIndex, created_at: new Date().toISOString(), details: { candidate_id: candidateId, ballot_hash: ballotHash } });
  save(store);
  return ballotHash;
}

// For unopposed YES/NO votes
export function submitUnopposedVote(electionId, candidateId, voterIndex, voteValue) {
  const store = load();
  if (store.votes.some(v => v.election_id === electionId && v.voter_index === voterIndex)) {
    throw new Error('You have already voted in this election');
  }
  const ballotHash = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  store.votes.push({ election_id: electionId, candidate_id: candidateId, voter_index: voterIndex, ballot_hash: ballotHash, vote_value: voteValue, submitted_at: new Date().toISOString() });
  const cIdx = store.candidates.findIndex(c => c.id === candidateId);
  if (cIdx !== -1) {
    if (voteValue === 'yes') store.candidates[cIdx].yes_votes = (store.candidates[cIdx].yes_votes || 0) + 1;
    else store.candidates[cIdx].no_votes = (store.candidates[cIdx].no_votes || 0) + 1;
  }
  store.audit_log.push({ id: `a${Date.now()}`, election_id: electionId, event_type: 'unopposed_vote_submitted', actor_id: voterIndex, created_at: new Date().toISOString(), details: { vote_value: voteValue, ballot_hash: ballotHash } });
  save(store);
  return ballotHash;
}

export function verifyBallotHash(hash) {
  return load().votes.some(v => v.ballot_hash === hash);
}

// ─── Multi-position queue helpers ─────────────────────────────────────────────
// Returns all open elections a voter still hasn't voted in, sorted by vote_order
export function getPendingElections(voterIndex) {
  const store = load();
  const voted = new Set(store.votes.filter(v => v.voter_index === voterIndex).map(v => v.election_id));
  return store.elections
    .filter(e => e.status === 'open' && !voted.has(e.id))
    .sort((a, b) => (a.vote_order || 0) - (b.vote_order || 0));
}

// Returns elections voter has completed
export function getCompletedElections(voterIndex) {
  const store = load();
  const voted = new Set(store.votes.filter(v => v.voter_index === voterIndex).map(v => v.election_id));
  return store.elections.filter(e => voted.has(e.id));
}

// ─── Anomaly Flags ───────────────────────────────────────────────────────────
export function getFlags(electionId) { return load().anomaly_flags.filter(f => !f.is_dismissed && f.election_id === electionId); }
export function dismissFlag(id) {
  const store = load();
  const idx = store.anomaly_flags.findIndex(f => f.id === id);
  if (idx !== -1) store.anomaly_flags[idx].is_dismissed = true;
  save(store);
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export function getAuditLog(electionId) { return load().audit_log.filter(a => a.election_id === electionId); }

// ─── Stats ───────────────────────────────────────────────────────────────────
export function getTurnoutData(electionId) {
  const votes = load().votes.filter(v => v.election_id === electionId);
  const byHour = {};
  votes.forEach(v => {
    const h = new Date(v.submitted_at).getHours();
    byHour[h] = (byHour[h] || 0) + 1;
  });
  const startHour = 8;
  const now = new Date().getHours();
  const result = [];
  let running = 0;
  for (let h = startHour; h <= Math.max(now, startHour + 1); h++) {
    running += (byHour[h] || 0);
    result.push({ time: `${String(h).padStart(2, '0')}:00`, votes: running + Math.floor(Math.random() * 30) });
  }
  return result.length > 0 ? result : [{ time: '08:00', votes: 0 }];
}
