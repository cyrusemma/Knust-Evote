import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Download, ArrowLeft } from 'lucide-react';
import { getElection, getAuditLog } from '../../lib/mockData';

const EVENT_COLORS = {
  vote_submitted: 'text-success bg-success/10',
  election_opened: 'text-navy bg-navy-light',
  election_closed: 'text-muted bg-bg',
  otp_issued: 'text-warning bg-warning/10',
  otp_verified: 'text-navy bg-navy-light',
  otp_failed: 'text-danger bg-danger/10',
  anomaly_flagged: 'text-danger bg-danger/10',
  vote_duplicate_blocked: 'text-danger bg-danger/10',
  election_created: 'text-navy bg-navy-light',
};

export default function AuditLog() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setElection(getElection(id));
    setLogs(getAuditLog(id).reverse()); // newest first
  }, [id]);

  const filtered = filter ? logs.filter(l => l.event_type.includes(filter)) : logs;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `audit_log_${id}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-navy py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-surface" />
          <span className="text-lg font-display font-bold text-surface">KNUSTVote</span>
          <span className="text-xs bg-gold text-surface px-2 py-0.5 uppercase font-bold tracking-wider ml-2">Commissioner</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <Link to="/commissioner" className="inline-flex items-center text-muted hover:text-navy text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Audit Log</h1>
            <p className="text-sm text-muted mt-1">{election.title}</p>
          </div>
          <button onClick={handleExport} className="bg-transparent border border-navy text-navy font-display font-medium px-4 py-2 hover:bg-navy-light transition-colors flex items-center text-sm">
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </button>
        </div>

        {election.audit_log_hash && (
          <div className="bg-surface border border-border p-4 mb-6">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Sealed Audit Hash (SHA-256)</p>
            <p className="font-mono text-xs text-navy break-all">{election.audit_log_hash}</p>
          </div>
        )}

        {/* Filter */}
        <div className="mb-4">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-border px-3 py-2 text-sm bg-surface text-navy focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="">All Events</option>
            <option value="vote_submitted">Votes</option>
            <option value="otp">OTP Events</option>
            <option value="anomaly">Anomalies</option>
            <option value="election">Election Events</option>
          </select>
        </div>

        {/* Log table */}
        <div className="bg-surface border border-border">
          <div className="grid grid-cols-[120px_1fr_1fr_auto] gap-x-4 px-5 py-3 border-b border-border bg-bg">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Time</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Event</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Actor</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Details</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-muted text-sm">No log entries found</div>
            ) : (
              filtered.map(log => (
                <div key={log.id} className="grid grid-cols-[120px_1fr_1fr_auto] gap-x-4 px-5 py-3 hover:bg-bg/50 transition-colors items-center text-sm">
                  <span className="text-xs text-muted font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 w-fit ${EVENT_COLORS[log.event_type] || 'text-muted bg-bg'}`}>
                    {log.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-muted font-mono truncate">{log.actor_id || '—'}</span>
                  <span className="text-xs text-muted max-w-[140px] truncate" title={JSON.stringify(log.details)}>
                    {Object.keys(log.details || {}).length > 0 ? JSON.stringify(log.details).slice(0, 30) + '...' : '—'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
