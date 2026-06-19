import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getElections, getCandidates, hasVoted } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';

export default function VoterDashboard() {
  const { student, signOut } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const openElections = getElections().filter(e => e.status === 'open');
    setElections(openElections);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-navy">{student?.full_name}</p>
            <p className="text-xs text-muted font-mono">{student?.index_number}</p>
          </div>
          <Link to="/vote/my-receipts" className="text-sm font-medium text-navy hover:underline hidden md:block">My Receipts</Link>
          <button onClick={signOut} className="text-sm font-medium text-danger hover:underline">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-navy">
            Welcome, {student?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1">You have {elections.length} active election{elections.length !== 1 ? 's' : ''} open for voting.</p>
        </div>

        {elections.length === 0 ? (
          <div className="bg-surface border border-border p-16 text-center">
            <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-navy mb-2">No active elections</h3>
            <p className="text-muted">There are no elections currently open for voting. Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {elections.map((election) => {
              const voted = hasVoted(election.id, student?.index_number);
              const candidates = getCandidates(election.id);
              const endDate = new Date(election.end_time);
              const hoursLeft = Math.max(0, Math.floor((endDate - Date.now()) / 3600000));

              return (
                <div key={election.id} className="bg-surface border border-border p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wide flex items-center ${voted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {voted ? <><CheckCircle className="w-3 h-3 mr-1" /> Voted</> : <><Clock className="w-3 h-3 mr-1" /> Open</>}
                    </span>
                    <span className="text-xs text-muted">{hoursLeft}h remaining</span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-navy mb-2 leading-snug">{election.title}</h3>
                  <p className="text-sm text-muted mb-4 flex-1 line-clamp-2">{election.description}</p>

                  {/* Mini candidate preview */}
                  <div className="flex -space-x-2 mb-5">
                    {candidates.slice(0, 3).map(c => (
                      <div key={c.id} title={c.full_name} className="w-8 h-8 rounded-full border-2 border-surface text-xs text-white font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.color }}>
                        {c.initials}
                      </div>
                    ))}
                    {candidates.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-muted text-xs text-white font-bold flex items-center justify-center">+{candidates.length - 3}</div>
                    )}
                    <span className="ml-3 text-sm text-muted self-center">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
                  </div>

                  {voted ? (
                    <Link to="/vote/my-receipts" className="w-full text-center bg-transparent border border-navy text-navy font-display font-medium py-3 hover:bg-navy-light transition-colors block">
                      View My Receipt
                    </Link>
                  ) : (
                    <Link to={`/vote/${election.id}`} className="w-full text-center bg-navy text-surface font-display font-medium py-3 hover:bg-navy-dark transition-colors block">
                      Cast Your Ballot →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Past elections */}
        {getElections().filter(e => e.status === 'closed').length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-display font-bold text-muted uppercase tracking-wider mb-4">Past Elections</h2>
            <div className="space-y-3">
              {getElections().filter(e => e.status === 'closed').map(e => (
                <Link key={e.id} to={`/results/${e.id}`} className="bg-surface border border-border px-6 py-4 flex justify-between items-center hover:bg-bg transition-colors block">
                  <span className="font-display font-semibold text-navy">{e.title}</span>
                  <span className="text-sm text-navy font-medium">View results →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
