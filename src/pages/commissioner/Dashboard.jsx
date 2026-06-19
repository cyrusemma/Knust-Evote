import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Vote, Users, BarChart2, Plus, Clock, CheckCircle, Activity } from 'lucide-react';
import { getElections, getCandidates, getAllVotes, getFlags } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';

export default function CommissionerDashboard() {
  const { student, signOut } = useAuth();
  const [elections, setElections] = useState([]);

  useEffect(() => {
    setElections(getElections());
  }, []);

  const allVotes = getAllVotes();
  const allFlags = elections.flatMap(e => getFlags(e.id));
  const openElections = elections.filter(e => e.status === 'open');
  const closedElections = elections.filter(e => e.status === 'closed');

  const stats = [
    { label: 'Total Elections', value: elections.length, icon: Vote, color: 'text-navy' },
    { label: 'Active Now', value: openElections.length, icon: Activity, color: 'text-success' },
    { label: 'Total Votes Cast', value: allVotes.length, icon: CheckCircle, color: 'text-navy' },
    { label: 'Unreviewed Flags', value: allFlags.length, icon: BarChart2, color: allFlags.length > 0 ? 'text-danger' : 'text-muted' },
  ];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Navbar */}
      <header className="bg-navy py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-surface" />
          <span className="text-lg font-display font-bold text-surface">KNUSTVote</span>
          <span className="text-xs bg-gold text-surface px-2 py-0.5 uppercase font-bold tracking-wider ml-2">Commissioner</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-surface">{student?.full_name}</p>
            <p className="text-xs text-navy-light font-mono">{student?.index_number}</p>
          </div>
          <button onClick={signOut} className="text-sm font-medium text-navy-light hover:text-surface">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface border border-border p-5">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold text-muted uppercase tracking-wider">{label}</p>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-3xl font-display font-bold text-navy">{value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-navy">Elections</h2>
          <Link to="/commissioner/elections/new" className="bg-navy text-surface font-display font-medium px-5 py-2 hover:bg-navy-dark transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" /> New Election
          </Link>
        </div>

        {/* Open Elections */}
        {openElections.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Active</h3>
            <div className="space-y-3">
              {openElections.map(e => {
                const candidates = getCandidates(e.id);
                const votes = getAllVotes().filter(v => v.election_id === e.id);
                const flags = getFlags(e.id);
                return (
                  <div key={e.id} className="bg-surface border border-border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        <h4 className="font-display font-bold text-navy truncate">{e.title}</h4>
                      </div>
                      <p className="text-xs text-muted">{candidates.length} candidates · {votes.length} votes cast · Closes {new Date(e.end_time).toLocaleString()}</p>
                      {flags.length > 0 && (
                        <p className="text-xs text-danger font-bold mt-1">⚠ {flags.length} anomaly flag{flags.length > 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/commissioner/elections/${e.id}/candidates`} className="text-xs font-bold px-3 py-2 border border-border text-navy hover:bg-navy-light transition-colors flex items-center gap-1">
                        <Users className="w-3 h-3" /> Candidates
                      </Link>
                      <Link to={`/commissioner/elections/${e.id}/monitor`} className="text-xs font-bold px-3 py-2 bg-navy text-surface hover:bg-navy-dark transition-colors flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Live Monitor
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Closed Elections */}
        {closedElections.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Closed</h3>
            <div className="space-y-3">
              {closedElections.map(e => {
                const candidates = getCandidates(e.id);
                const votes = getAllVotes().filter(v => v.election_id === e.id);
                return (
                  <div key={e.id} className="bg-surface border border-border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-80">
                    <div>
                      <h4 className="font-display font-semibold text-navy">{e.title}</h4>
                      <p className="text-xs text-muted">{candidates.length} candidates · {votes.length} votes cast · Closed {new Date(e.end_time).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/commissioner/elections/${e.id}/audit`} className="text-xs font-bold px-3 py-2 border border-border text-navy hover:bg-navy-light transition-colors flex items-center gap-1">
                        Audit Log
                      </Link>
                      <Link to={`/results/${e.id}`} className="text-xs font-bold px-3 py-2 border border-border text-navy hover:bg-navy-light transition-colors flex items-center gap-1">
                        Public Results
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
