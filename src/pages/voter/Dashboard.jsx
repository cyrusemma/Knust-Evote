import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, Loader2, ListChecks, Trophy, ChevronRight, ThumbsUp } from 'lucide-react';
import { getElections, getCandidates, hasVoted, getPendingElections, getCompletedElections, isElectionUnopposed } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function VoterDashboard() {
  const { student, signOut } = useAuth();
  const [allOpen, setAllOpen] = useState([]);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [closedElections, setClosedElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const open = getElections().filter(e => e.status === 'open').sort((a, b) => (a.vote_order || 0) - (b.vote_order || 0));
    const p = getPendingElections(student.index_number);
    const c = getCompletedElections(student.index_number).filter(e => e.status === 'open');
    const closed = getElections().filter(e => e.status === 'closed');
    setAllOpen(open);
    setPending(p);
    setCompleted(c);
    setClosedElections(closed);
    setLoading(false);
  }, [student]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-navy animate-spin" />
    </div>
  );

  const totalPositions = allOpen.length;
  const votedCount = completed.length;
  const progressPct = totalPositions > 0 ? (votedCount / totalPositions) * 100 : 0;
  const allDone = pending.length === 0 && totalPositions > 0;

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-navy">{student?.full_name}</p>
            <p className="text-xs text-muted font-mono">{student?.index_number}</p>
          </div>
          <Link to="/vote/my-receipts" className="text-sm font-medium text-navy hover:underline hidden md:block">My Receipts</Link>
          <button onClick={signOut} className="text-sm font-medium text-danger hover:underline">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">

        {/* Welcome + progress */}
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-navy">
            Welcome, {student?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1 mb-6">
            {totalPositions === 0
              ? 'No elections are currently open.'
              : allDone
              ? 'You have voted in all open positions. Thank you!'
              : `You have ${pending.length} position${pending.length !== 1 ? 's' : ''} remaining out of ${totalPositions}.`
            }
          </p>

          {/* Multi-position progress bar */}
          {totalPositions > 0 && (
            <div className="bg-surface border border-border p-5 mb-8">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-navy" />
                  <span className="font-display font-bold text-navy text-sm uppercase tracking-wide">Voting Progress</span>
                </div>
                <span className="font-mono text-sm font-bold text-navy">{votedCount} / {totalPositions} positions</span>
              </div>
              <div className="h-3 bg-navy-light overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-navy"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {allOpen.map((el, i) => {
                  const done = hasVoted(el.id, student?.index_number);
                  return (
                    <span key={el.id} className={`text-xs font-bold px-2 py-1 flex items-center gap-1 ${done ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {done ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 inline-flex items-center justify-center text-[9px]">{i + 1}</span>}
                      {el.title.length > 28 ? el.title.slice(0, 28) + '…' : el.title}
                    </span>
                  );
                })}
              </div>

              {/* "Start Voting" CTA if there are pending positions */}
              {pending.length > 0 && (
                <Link
                  to={`/vote/${pending[0].id}`}
                  className="mt-4 w-full bg-navy text-surface font-display font-bold py-3 hover:bg-navy-dark transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {votedCount === 0 ? 'Start Voting' : 'Continue to Next Position'}: {pending[0].title}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {allDone && (
                <div className="mt-4 flex items-center gap-2 text-success font-bold text-sm">
                  <Trophy className="w-5 h-5" /> All done! Your votes have been recorded.
                </div>
              )}
            </div>
          )}
        </div>

        {/* All open elections grid */}
        {allOpen.length === 0 ? (
          <div className="bg-surface border border-border p-16 text-center">
            <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-navy mb-2">No active elections</h3>
            <p className="text-muted">There are no elections currently open for voting. Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allOpen.map((election, idx) => {
              const voted = hasVoted(election.id, student?.index_number);
              const candidates = getCandidates(election.id);
              const unopposed = isElectionUnopposed(election.id);
              const endDate = new Date(election.end_time);
              const hoursLeft = Math.max(0, Math.floor((endDate - Date.now()) / 3600000));

              return (
                <motion.div
                  key={election.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.35 }}
                  className={`bg-surface border-2 p-6 flex flex-col hover:shadow-md transition-shadow ${voted ? 'border-success/30' : 'border-border'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wide flex items-center gap-1 ${voted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {voted ? <><CheckCircle className="w-3 h-3" /> Voted</> : <><Clock className="w-3 h-3" /> Open</>}
                      </span>
                      {unopposed && (
                        <span className="text-xs font-bold px-2 py-1 bg-gold/10 text-gold uppercase tracking-wide flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> YES/NO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{hoursLeft}h remaining</span>
                  </div>

                  {/* Order badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-navy text-surface text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                    <h3 className="text-xl font-display font-bold text-navy leading-snug">{election.title}</h3>
                  </div>
                  <p className="text-sm text-muted mb-4 flex-1 line-clamp-2">{election.description}</p>

                  {/* Candidate preview */}
                  {!unopposed ? (
                    <div className="flex -space-x-2 mb-5">
                      {candidates.slice(0, 3).map(c => (
                        <div key={c.id} title={c.full_name}
                          className="w-8 h-8 rounded-full border-2 border-surface text-xs text-white font-bold flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: c.color }}>
                          {c.photo_url ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" /> : c.initials}
                        </div>
                      ))}
                      {candidates.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-muted text-xs text-white font-bold flex items-center justify-center">
                          +{candidates.length - 3}
                        </div>
                      )}
                      <span className="ml-3 text-sm text-muted self-center">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 flex-shrink-0 overflow-hidden" style={{ backgroundColor: candidates[0]?.color }}>
                        {candidates[0]?.photo_url
                          ? <img src={candidates[0].photo_url} alt={candidates[0].full_name} className="w-full h-full object-cover" />
                          : <span className="text-white text-xs font-bold flex items-center justify-center h-full">{candidates[0]?.initials}</span>
                        }
                      </div>
                      <span className="text-sm text-muted">{candidates[0]?.full_name} — Uncontested</span>
                    </div>
                  )}

                  {voted ? (
                    <Link to="/vote/my-receipts" className="w-full text-center bg-transparent border border-navy text-navy font-display font-medium py-3 hover:bg-navy-light transition-colors block">
                      View My Receipt
                    </Link>
                  ) : (
                    <Link to={`/vote/${election.id}`} className="w-full text-center bg-navy text-surface font-display font-medium py-3 hover:bg-navy-dark transition-colors block flex items-center justify-center gap-2">
                      Cast Your Ballot <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Past elections */}
        {closedElections.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-display font-bold text-muted uppercase tracking-wider mb-4">Past Elections</h2>
            <div className="space-y-3">
              {closedElections.map(e => (
                <Link key={e.id} to={`/results/${e.id}`}
                  className="bg-surface border border-border px-6 py-4 flex justify-between items-center hover:bg-bg transition-colors group block">
                  <div>
                    <span className="font-display font-semibold text-navy block">{e.title}</span>
                    <span className="text-xs text-muted">Closed · {new Date(e.end_time).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm text-navy font-medium group-hover:underline flex items-center gap-1">
                    View results <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
