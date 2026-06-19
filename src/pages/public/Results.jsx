import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, ShieldCheck, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { getElection, getCandidates, getAllVotes } from '../../lib/mockData';

export default function Results() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const e = getElection(electionId);
    const c = getCandidates(electionId).slice().sort((a, b) => b.vote_count - a.vote_count);
    setElection(e);
    setCandidates(c);
    setLoading(false);
  }, [electionId]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center">Loading...</div>;
  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center font-body text-muted">Results not available.</div>;

  const totalVotes = candidates.reduce((s, c) => s + c.vote_count, 0);
  const registeredVoters = 3500;
  const turnoutPct = ((totalVotes / registeredVoters) * 100).toFixed(1);
  const allVotes = getAllVotes().filter(v => v.election_id === electionId);

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </Link>
        <Link to="/verify" className="text-sm font-medium text-navy hover:underline">Verify Receipt</Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-navy-light text-navy px-4 py-2 text-xs font-bold uppercase tracking-wider mb-4">
            <BarChart2 className="w-4 h-4 mr-2" /> Official Results
          </div>
          <h1 className="text-4xl font-display font-bold text-navy">{election.title}</h1>
          {election.status !== 'closed' && (
            <p className="text-warning font-medium mt-2 text-sm">⚡ Live — Results update in real time</p>
          )}
        </div>

        {/* Audit integrity */}
        {election.audit_log_hash && (
          <div className="bg-surface border border-border mb-8">
            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-bg transition-colors" onClick={() => setShowAudit(!showAudit)}>
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
                <p className="text-sm text-muted mb-2">The election record has been cryptographically sealed with the following SHA-256 hash:</p>
                <div className="bg-surface border border-border p-3 font-mono text-xs text-navy break-all select-all">{election.audit_log_hash}</div>
                <div className="mt-3 flex space-x-4">
                  <a href="#" className="text-xs text-navy hover:underline font-medium">Download audit log (JSON)</a>
                  <a href="#" className="text-xs text-navy hover:underline font-medium">How to verify independently</a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border p-5 text-center">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Total Votes</p>
            <p className="text-3xl font-display font-bold text-navy">{totalVotes.toLocaleString()}</p>
          </div>
          <div className="bg-surface border border-border p-5 text-center">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Registered</p>
            <p className="text-3xl font-display font-bold text-navy">{registeredVoters.toLocaleString()}</p>
          </div>
          <div className="bg-surface border border-border p-5 text-center">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Turnout</p>
            <p className="text-3xl font-display font-bold text-navy">{turnoutPct}%</p>
          </div>
        </div>

        {/* Tally */}
        <div className="bg-surface border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-bold text-navy text-lg">Final Tally</h2>
          </div>
          {candidates.map((c, i) => {
            const pct = totalVotes ? ((c.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
            const isWinner = i === 0 && c.vote_count > 0;
            return (
              <div key={c.id} className="p-5 border-b last:border-b-0 border-border hover:bg-bg/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0" style={{ backgroundColor: c.color }}>
                      {c.photo_url
                        ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" />
                        : c.initials
                      }
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-navy flex items-center gap-2">
                        {c.full_name}
                        {isWinner && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 font-bold uppercase tracking-wide flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Winner</span>}
                      </h3>
                      <p className="text-xs text-muted">{c.position_title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-xl text-navy">{c.vote_count.toLocaleString()}</p>
                    <p className="text-xs text-muted">votes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-3 bg-navy-light">
                    <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isWinner ? '#B8860B' : '#1A3A6B' }}></div>
                  </div>
                  <span className="font-mono text-sm font-bold text-navy w-12 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link to="/verify" className="inline-flex items-center border border-navy text-navy font-display font-medium py-3 px-6 hover:bg-navy-light transition-colors">
            Verify your ballot receipt →
          </Link>
        </div>
      </main>
    </div>
  );
}
