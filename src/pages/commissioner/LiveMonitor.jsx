import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, AlertTriangle, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from 'recharts';
import { getElection, getCandidates, getAllVotes, getFlags, dismissFlag, closeElection, getTurnoutData } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link as RouterLink } from 'react-router-dom';

const CANDIDATE_COLORS = ['#1A3A6B', '#B8860B', '#16A34A', '#DC2626', '#7C3AED', '#D97706'];

export default function LiveMonitor() {
  const { id } = useParams();
  const { signOut } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [flags, setFlags] = useState([]);
  const [turnoutData, setTurnoutData] = useState([]);
  const [totalEligible] = useState(3500);
  const [tick, setTick] = useState(0);

  const reload = () => {
    setElection(getElection(id));
    setCandidates(getCandidates(id));
    setFlags(getFlags(id));
    setTurnoutData(getTurnoutData(id));
  };

  useEffect(() => {
    reload();
    // Simulate realtime updates every 5 seconds
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => { reload(); }, [tick]);

  const handleDismissFlag = (flagId) => {
    dismissFlag(flagId);
    reload();
    toast.success('Flag dismissed');
  };

  const handleCloseElection = async () => {
    if (!window.confirm('Close this election? Voting will stop immediately and the audit log will be sealed.')) return;
    const hash = closeElection(id);
    reload();
    toast.success('Election closed. Audit log sealed.');
  };

  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center">Loading...</div>;

  const totalVotes = candidates.reduce((s, c) => s + c.vote_count, 0);
  const turnoutPct = ((totalVotes / totalEligible) * 100).toFixed(1);
  const endTime = new Date(election.end_time);
  const msLeft = Math.max(0, endTime - Date.now());
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft = Math.floor((msLeft % 3600000) / 60000);

  const chartData = candidates.map((c, i) => ({
    name: c.full_name.split(' ')[0],
    votes: c.vote_count,
    fill: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-navy py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-surface" />
          <span className="text-lg font-display font-bold text-surface">Live Monitor</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs bg-success text-surface px-2 py-1 font-bold uppercase tracking-wide flex items-center">
            <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span> Live
          </span>
          <Link to="/commissioner" className="text-xs text-navy-light hover:text-surface font-medium flex items-center">
            <ArrowLeft className="w-3 h-3 mr-1" /> Dashboard
          </Link>
          <button onClick={signOut} className="text-xs font-medium text-navy-light hover:text-surface">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left Column ── */}
        <div className="space-y-6">

          {/* Election info + countdown */}
          <div className="bg-surface border border-border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-navy leading-tight">{election.title}</h2>
                {election.status === 'closed'
                  ? <span className="text-xs bg-muted/20 text-muted px-2 py-0.5 font-bold uppercase">Closed</span>
                  : <span className="text-xs bg-success/10 text-success px-2 py-0.5 font-bold uppercase">Open</span>
                }
              </div>
              {election.status === 'open' && (
                <div className="text-right">
                  <p className="text-xs text-muted">Time Remaining</p>
                  <p className="font-mono font-bold text-navy text-lg">{hoursLeft}h {minsLeft}m</p>
                </div>
              )}
            </div>

            {/* Turnout */}
            <p className="text-sm text-muted mb-1">Turnout</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-display font-bold text-navy">{totalVotes.toLocaleString()}</span>
              <span className="text-muted text-sm">of {totalEligible.toLocaleString()} eligible</span>
            </div>
            <div className="w-full h-3 bg-navy-light mb-1">
              <div className="h-full bg-navy transition-all duration-700" style={{ width: `${Math.min(turnoutPct, 100)}%` }}></div>
            </div>
            <p className="text-xs text-right text-muted font-mono">{turnoutPct}%</p>
          </div>

          {/* Turnout over time */}
          <div className="bg-surface border border-border p-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Votes Cast by Hour</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={turnoutData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#DDE2ED" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ border: '1px solid #DDE2ED', borderRadius: 0, boxShadow: 'none', fontSize: 12 }} />
                  <Area type="monotone" dataKey="votes" stroke="#1A3A6B" fill="#E8EDF5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Election Controls */}
          <div className={`border p-6 ${election.status === 'closed' ? 'bg-surface border-border opacity-60' : 'bg-danger/5 border-danger/20'}`}>
            <h3 className="font-display font-bold text-danger mb-2 text-sm uppercase tracking-wide">Election Controls</h3>
            <p className="text-sm text-muted mb-4">Closing the election seals all votes and generates the audit integrity hash.</p>
            <button
              onClick={handleCloseElection}
              disabled={election.status === 'closed'}
              className="w-full bg-danger text-surface font-display font-semibold py-3 hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {election.status === 'closed' ? '✓ Election Closed' : 'Close Election'}
            </button>
            {election.status === 'closed' && election.audit_log_hash && (
              <div className="mt-3 bg-surface border border-border p-3">
                <p className="text-xs text-muted mb-1 font-bold">Audit Seal Hash</p>
                <p className="font-mono text-xs text-navy break-all">{election.audit_log_hash}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Live results bar chart */}
          <div className="bg-surface border border-border p-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Live Vote Counts</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#111827' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ border: '1px solid #DDE2ED', borderRadius: 0, boxShadow: 'none', fontSize: 12 }} />
                  <Bar dataKey="votes" radius={[0, 2, 2, 0]} barSize={22} label={{ position: 'right', fontSize: 12, fill: '#6B7280' }}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed table below */}
            <div className="mt-4 space-y-2">
              {candidates
                .slice()
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((c, i) => {
                  const pct = totalVotes ? ((c.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-muted w-5">#{i + 1}</span>
                        <div className="w-5 h-5 rounded-sm flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }}>
                          {c.initials?.[0]}
                        </div>
                        <span className="text-sm font-medium text-navy truncate max-w-[140px]">{c.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-navy font-mono">{c.vote_count}</span>
                        <span className="text-xs text-muted font-mono w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Anomaly flags */}
          <div className="bg-surface border border-border flex flex-col" style={{ minHeight: '300px' }}>
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-danger" /> Anomaly Flags
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${flags.length > 0 ? 'bg-danger text-surface' : 'bg-success/10 text-success'}`}>
                {flags.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {flags.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <ShieldCheck className="w-10 h-10 text-success mb-2" />
                  <p className="text-success font-medium text-sm">No anomalies detected</p>
                  <p className="text-muted text-xs mt-1">System is running normally</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map(flag => (
                    <div key={flag.id} className="border border-border p-3 bg-surface">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 uppercase tracking-wide ${
                          flag.severity === 'high' ? 'bg-danger/10 text-danger' :
                          flag.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-navy-light text-navy'
                        }`}>{flag.severity}</span>
                        <span className="text-xs text-muted font-mono">{new Date(flag.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold text-navy mb-1">{flag.flag_type.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-xs text-muted mb-3">{flag.description}</p>
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleDismissFlag(flag.id)} className="text-xs text-muted hover:text-navy font-medium px-3 py-1 border border-border hover:bg-bg transition-colors">Dismiss</button>
                        <button className="text-xs bg-navy text-surface font-medium px-3 py-1 hover:bg-navy-dark transition-colors">Investigate</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
