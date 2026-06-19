import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Plus, Trash2, Edit2, Check, X, AlertCircle, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { getElection, getAllCandidates, addCandidate, updateCandidate, deleteCandidate } from '../../lib/mockData';
import { toast } from 'react-hot-toast';

const COLORS = ['#1A3A6B', '#B8860B', '#16A34A', '#DC2626', '#7C3AED', '#D97706', '#059669', '#2563EB'];

function CandidateForm({ electionId, onSave, onCancel, initial = null }) {
  const [form, setForm] = useState({
    full_name: initial?.full_name || '',
    position_title: initial?.position_title || '',
    manifesto: initial?.manifesto || '',
    photo_url: initial?.photo_url || '',
    is_unopposed: initial?.is_unopposed || false,
  });
  const [preview, setPreview] = useState(initial?.photo_url || '');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setPreview(url);
      setForm(f => ({ ...f, photo_url: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.position_title) {
      toast.error('Name and position are required');
      return;
    }
    onSave({ ...form, election_id: electionId });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-navy-light border border-border p-6 space-y-4">
      <h3 className="font-display font-bold text-navy text-lg">{initial ? 'Edit Candidate' : 'Add New Candidate'}</h3>

      {/* Photo upload */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 flex-shrink-0 bg-surface border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : <span className="text-3xl text-muted font-bold">{form.full_name?.[0] || '?'}</span>
          }
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Photo (optional)</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-muted file:mr-3 file:py-1 file:px-3 file:border file:border-border file:bg-surface file:text-navy file:text-xs file:font-bold file:cursor-pointer" />
          <p className="text-xs text-muted mt-1">JPG, PNG · will be cropped to square</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Full Name *</label>
          <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body" placeholder="e.g. Kwame Mensah" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Position *</label>
          <input value={form.position_title} onChange={e => setForm(f => ({ ...f, position_title: e.target.value }))} className="w-full border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body" placeholder="e.g. SRC President" required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Manifesto / Campaign Statement</label>
        <textarea
          value={form.manifesto}
          onChange={e => setForm(f => ({ ...f, manifesto: e.target.value }))}
          rows={3}
          className="w-full border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-surface font-body resize-none"
          placeholder="Brief manifesto or campaign message..."
        />
      </div>

      {/* Unopposed toggle */}
      <div
        className={`border-2 p-4 cursor-pointer transition-all flex items-start justify-between gap-4 ${form.is_unopposed ? 'border-gold bg-gold/5' : 'border-border bg-surface'}`}
        onClick={() => setForm(f => ({ ...f, is_unopposed: !f.is_unopposed }))}
      >
        <div>
          <p className="font-display font-bold text-navy text-sm">Running Unopposed</p>
          <p className="text-xs text-muted mt-0.5">Voters will cast a YES or NO confidence vote instead of selecting a candidate.</p>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {form.is_unopposed
            ? <ToggleRight className="w-8 h-8 text-gold" />
            : <ToggleLeft className="w-8 h-8 text-muted" />
          }
        </div>
      </div>
      {form.is_unopposed && (
        <div className="text-xs bg-gold/10 border border-gold/30 text-gold p-3 font-medium">
          ⚠️ When set as Unopposed, this election will display a YES / NO ballot to voters. Results will show confidence percentages.
        </div>
      )}

      <div className="flex space-x-3">
        <button type="submit" className="bg-navy text-surface font-display font-medium px-6 py-2 hover:bg-navy-dark transition-colors flex items-center">
          <Check className="w-4 h-4 mr-2" /> {initial ? 'Save Changes' : 'Add Candidate'}
        </button>
        <button type="button" onClick={onCancel} className="border border-border text-muted font-display font-medium px-6 py-2 hover:bg-surface transition-colors flex items-center">
          <X className="w-4 h-4 mr-2" /> Cancel
        </button>
      </div>
    </form>
  );
}

export default function ManageCandidates() {
  const { id: electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const reload = () => {
    setElection(getElection(electionId));
    setCandidates(getAllCandidates(electionId));
  };

  useEffect(() => { reload(); }, [electionId]);

  const handleAdd = (data) => {
    addCandidate(data);
    reload();
    setShowForm(false);
    toast.success('Candidate added!');
  };

  const handleEdit = (data) => {
    updateCandidate(editingId, data);
    reload();
    setEditingId(null);
    toast.success('Candidate updated!');
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remove ${name} from this election?`)) return;
    deleteCandidate(id);
    reload();
    toast.success('Candidate removed');
  };

  const handleToggleUnopposed = (c) => {
    updateCandidate(c.id, { is_unopposed: !c.is_unopposed });
    reload();
    toast.success(`${c.full_name} marked as ${!c.is_unopposed ? 'Unopposed (YES/NO vote)' : 'Regular candidate'}`);
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <Link to="/commissioner" className="inline-flex items-center text-muted hover:text-navy text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Manage Candidates</h1>
            <p className="text-muted text-sm mt-1">{election.title}</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-navy text-surface font-display font-medium px-5 py-2 hover:bg-navy-dark transition-colors flex items-center text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </button>
          )}
        </div>

        {election.status === 'open' && (
          <div className="bg-warning/10 border border-warning/50 text-warning text-sm p-3 mb-6 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            This election is live. Adding or editing candidates will immediately affect voters.
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="mb-6">
            <CandidateForm electionId={electionId} onSave={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Candidate list */}
        {candidates.length === 0 ? (
          <div className="bg-surface border border-border p-16 text-center">
            <UsersIcon className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-display font-bold text-navy text-lg mb-1">No candidates yet</h3>
            <p className="text-muted text-sm">Click "Add Candidate" to start building the ballot.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((c, idx) => (
              editingId === c.id ? (
                <CandidateForm key={c.id} electionId={electionId} initial={c} onSave={handleEdit} onCancel={() => setEditingId(null)} />
              ) : (
                <div key={c.id} className={`bg-surface border-2 p-5 flex items-start gap-4 transition-all ${c.is_unopposed ? 'border-gold' : 'border-border'}`}>
                  {/* Rank */}
                  <div className="w-7 h-7 flex-shrink-0 bg-navy-light text-navy text-xs font-bold flex items-center justify-center mt-1">
                    #{idx + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-display font-bold text-xl overflow-hidden" style={{ backgroundColor: c.color }}>
                    {c.photo_url
                      ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" />
                      : c.initials
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-display font-bold text-lg text-navy">{c.full_name}</h3>
                      {c.is_unopposed && (
                        <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 font-bold uppercase tracking-wide">Unopposed (YES/NO)</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">{c.position_title}</p>
                    {c.manifesto && <p className="text-sm text-muted line-clamp-2">{c.manifesto}</p>}
                    <p className="text-xs text-muted mt-2 font-mono">
                      {c.is_unopposed
                        ? `${c.yes_votes || 0} YES · ${c.no_votes || 0} NO`
                        : `${c.vote_count} votes`
                      }
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleUnopposed(c)}
                      title={c.is_unopposed ? 'Switch to regular vote' : 'Mark as Unopposed'}
                      className={`p-2 border text-xs font-bold transition-colors flex items-center gap-1 ${c.is_unopposed ? 'border-gold text-gold hover:bg-gold/10' : 'border-border text-muted hover:bg-navy-light'}`}
                    >
                      {c.is_unopposed ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {c.is_unopposed ? 'Unopposed' : 'Opposed'}
                    </button>
                    <button onClick={() => setEditingId(c.id)} className="p-2 border border-border text-navy hover:bg-navy-light transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id, c.full_name)} className="p-2 border border-border text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function UsersIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
