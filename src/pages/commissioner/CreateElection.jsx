import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { createElection } from '../../lib/mockData';
import { toast } from 'react-hot-toast';

export default function CreateElection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error('End time must be after start time'); return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const election = createElection({ ...form, status: 'open' });
      toast.success('Election created!');
      navigate(`/commissioner/elections/${election.id}/candidates`);
    } catch (err) {
      toast.error('Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-navy py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-surface" />
          <span className="text-lg font-display font-bold text-surface">KNUSTVote</span>
          <span className="text-xs bg-gold text-surface px-2 py-0.5 uppercase font-bold tracking-wider ml-2">Commissioner</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <Link to="/commissioner" className="inline-flex items-center text-muted hover:text-navy text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-display font-bold text-navy mb-8">Create New Election</h1>

        <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Election Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body text-navy"
              placeholder="e.g. SRC Presidential Election 2025/2026"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body resize-none"
              placeholder="Optional description of this election..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Election & Add Candidates →'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
