import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, ShieldCheck, ChevronDown, ChevronUp, BarChart2, Trophy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getElection, getCandidates, isElectionUnopposed } from '../../lib/mockData';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
  function fire(ratio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * ratio), colors: ['#1A3A6B', '#B8860B', '#FFFFFF', '#60A5FA', '#FBBF24'] });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2,  { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1,  { spread: 120, startVelocity: 45 });
}

// ─── Regular (contested) results ─────────────────────────────────────────────
function ContestedResults({ candidates, totalVotes, revealed }) {
  const winner = candidates[0];
  return (
    <div className="bg-surface border border-border">
      <div className="p-5 border-b border-border">
        <h2 className="font-display font-bold text-navy text-lg">Full Tally</h2>
      </div>
      {candidates.map((c, i) => {
        const pct = totalVotes ? ((c.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
        const isWinner = i === 0 && c.vote_count > 0;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            className="p-5 border-b last:border-b-0 border-border hover:bg-bg/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: c.color }}>
                  {c.photo_url ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" /> : c.initials}
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy flex items-center gap-2 flex-wrap">
                    {c.full_name}
                    {isWinner && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 font-bold uppercase tracking-wide flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Winner
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted">{c.position_title}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-bold text-xl text-navy">{c.vote_count.toLocaleString()}</p>
                <p className="text-xs text-muted">votes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-3 bg-navy-light overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ backgroundColor: isWinner ? '#B8860B' : '#1A3A6B' }}
                />
              </div>
              <span className="font-mono text-sm font-bold text-navy w-12 text-right">{pct}%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Unopposed (YES/NO confidence) results ───────────────────────────────────
function UnopposedResults({ candidate, totalVotes, revealed }) {
  if (!candidate) return null;
  const yes = candidate.yes_votes || 0;
  const no = candidate.no_votes || 0;
  const total = yes + no || 1;
  const yesPct = ((yes / total) * 100).toFixed(1);
  const noPct = ((no / total) * 100).toFixed(1);
  const passed = yes >= no;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-surface border border-border"
    >
      <div className="p-5 border-b border-border flex items-center gap-2">
        <h2 className="font-display font-bold text-navy text-lg">Confidence Vote Results</h2>
        <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 bg-navy-light text-navy">Unopposed</span>
      </div>

      {/* Candidate profile */}
      <div className="p-6 border-b border-border flex items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-display font-bold text-xl overflow-hidden"
          style={{ backgroundColor: candidate.color }}>
          {candidate.photo_url ? <img src={candidate.photo_url} alt={candidate.full_name} className="w-full h-full object-cover" /> : candidate.initials}
        </div>
        <div>
          <h3 className="font-display font-bold text-navy text-xl flex items-center gap-2">
            {candidate.full_name}
            {passed
              ? <span className="text-xs bg-success/10 text-success px-2 py-0.5 font-bold uppercase tracking-wide flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>
              : <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 font-bold uppercase tracking-wide">Not Confirmed</span>
            }
          </h3>
          <p className="text-xs text-muted">{candidate.position_title}</p>
        </div>
      </div>

      {/* YES bar */}
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-success" />
            <span className="font-display font-bold text-navy">YES</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-lg text-navy">{yes.toLocaleString()}</span>
            <span className="text-muted text-xs ml-2">votes</span>
          </div>
        </div>
        <div className="h-5 bg-navy-light overflow-hidden">
          <motion.div
            className="h-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${yesPct}%` }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <p className="text-right font-mono text-sm font-bold text-success mt-1">{yesPct}%</p>
      </div>

      {/* NO bar */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-danger" />
            <span className="font-display font-bold text-navy">NO</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-lg text-navy">{no.toLocaleString()}</span>
            <span className="text-muted text-xs ml-2">votes</span>
          </div>
        </div>
        <div className="h-5 bg-navy-light overflow-hidden">
          <motion.div
            className="h-full bg-danger"
            initial={{ width: 0 }}
            animate={{ width: `${noPct}%` }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <p className="text-right font-mono text-sm font-bold text-danger mt-1">{noPct}%</p>
      </div>
    </motion.div>
  );
}

// ─── Main Results page ────────────────────────────────────────────────────────
export default function Results() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const confettiFired = useRef(false);

  const [unopposed, setUnopposed] = useState(false);

  useEffect(() => {
    const e = getElection(electionId);
    const c = getCandidates(electionId).slice().sort((a, b) => b.vote_count - a.vote_count);
    const isUnopp = isElectionUnopposed(electionId);
    setElection(e);
    setCandidates(c);
    setUnopposed(isUnopp);
    setLoading(false);

    if (e?.status === 'closed' && !confettiFired.current) {
      // Only fire confetti for contested elections with a winner, or unopposed passing
      const shouldFireConfetti = isUnopp
        ? (c[0]?.yes_votes || 0) >= (c[0]?.no_votes || 0)
        : c[0]?.vote_count > 0;

      if (shouldFireConfetti) {
        confettiFired.current = true;
        setTimeout(() => {
          setRevealed(true);
          fireConfetti();
          setTimeout(fireConfetti, 800);
        }, 600);
      } else {
        setRevealed(true);
      }
    } else {
      setRevealed(true);
    }
  }, [electionId]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-body text-muted">Loading results...</div>;
  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center font-body text-muted">Results not available.</div>;

  const totalVotes = unopposed
    ? (candidates[0]?.yes_votes || 0) + (candidates[0]?.no_votes || 0)
    : candidates.reduce((s, c) => s + c.vote_count, 0);

  const registeredVoters = 3500;
  const turnoutPct = ((totalVotes / registeredVoters) * 100).toFixed(1);
  const winner = candidates[0];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </Link>
        <Link to="/verify" className="text-sm font-medium text-navy hover:underline">Verify Receipt</Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-navy-light text-navy px-4 py-2 text-xs font-bold uppercase tracking-wider mb-4">
            <BarChart2 className="w-4 h-4 mr-2" />
            {unopposed ? 'Confidence Vote Results' : 'Official Results'}
          </div>
          <h1 className="text-4xl font-display font-bold text-navy mb-2">{election.title}</h1>
          {election.status !== 'closed'
            ? <p className="text-warning font-medium text-sm">⚡ Live — Results update in real time</p>
            : <p className="text-success font-medium text-sm">✓ Election Closed — Final Results</p>
          }
        </div>

        {/* Winner spotlight — contested only */}
        {!unopposed && election.status === 'closed' && winner?.vote_count > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-10 bg-surface border-2 border-gold p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
            <Trophy className="w-12 h-12 text-gold mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Winner</p>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gold flex items-center justify-center text-white font-display font-bold text-2xl"
                style={{ backgroundColor: winner.color }}>
                {winner.photo_url ? <img src={winner.photo_url} alt={winner.full_name} className="w-full h-full object-cover" /> : winner.initials}
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold text-navy mb-1">{winner.full_name}</h2>
            <p className="text-muted text-sm mb-4">{winner.position_title}</p>
            <div className="inline-flex items-center bg-gold/10 text-gold px-6 py-2 font-mono font-bold text-xl">
              {winner.vote_count.toLocaleString()} votes
              <span className="ml-3 text-sm font-normal text-muted">
                ({totalVotes ? ((winner.vote_count / totalVotes) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </motion.div>
        )}

        {/* Unopposed winner/fail spotlight */}
        {unopposed && election.status === 'closed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className={`mb-10 p-8 text-center relative overflow-hidden border-2 ${
              (winner?.yes_votes || 0) >= (winner?.no_votes || 0) ? 'border-success bg-success/5' : 'border-danger bg-danger/5'
            }`}
          >
            {(winner?.yes_votes || 0) >= (winner?.no_votes || 0)
              ? <><Trophy className="w-12 h-12 text-success mx-auto mb-3" /><p className="text-xs font-bold uppercase tracking-widest text-success mb-2">Confirmed by Confidence Vote</p></>
              : <><ThumbsDown className="w-12 h-12 text-danger mx-auto mb-3" /><p className="text-xs font-bold uppercase tracking-widest text-danger mb-2">Rejected by Confidence Vote</p></>
            }
            <h2 className="text-3xl font-display font-bold text-navy">{winner?.full_name}</h2>
            <p className="text-muted text-sm mt-1">{winner?.position_title}</p>
          </motion.div>
        )}

        {/* Audit integrity */}
        {election.audit_log_hash && (
          <div className="bg-surface border border-border mb-8">
            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-bg/50 transition-colors" onClick={() => setShowAudit(!showAudit)}>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-display font-bold text-navy text-sm">Audit Integrity Sealed</h3>
                  <p className="text-xs text-muted">Published {new Date(election.results_published_at).toLocaleString()}</p>
                </div>
              </div>
              {showAudit ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </div>
            {showAudit && (
              <div className="p-4 border-t border-border bg-bg/50">
                <p className="text-sm text-muted mb-2">SHA-256 seal of the audit record:</p>
                <div className="bg-surface border border-border p-3 font-mono text-xs text-navy break-all select-all">{election.audit_log_hash}</div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Votes', value: totalVotes.toLocaleString() },
            { label: 'Registered', value: (3500).toLocaleString() },
            { label: 'Turnout', value: `${turnoutPct}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border p-5 text-center">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{label}</p>
              <p className="text-3xl font-display font-bold text-navy">{value}</p>
            </div>
          ))}
        </div>

        {/* Tally — contested or unopposed */}
        {unopposed
          ? <UnopposedResults candidate={candidates[0]} totalVotes={totalVotes} revealed={revealed} />
          : <ContestedResults candidates={candidates} totalVotes={totalVotes} revealed={revealed} />
        }

        <div className="mt-10 text-center">
          <Link to="/verify" className="inline-flex items-center border border-navy text-navy font-display font-medium py-3 px-6 hover:bg-navy-light transition-colors">
            Verify your ballot receipt →
          </Link>
        </div>
      </main>
    </div>
  );
}
