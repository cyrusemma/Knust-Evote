import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft, Loader2, Copy, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCandidates, getElection, hasVoted, submitVote, getVoteReceipt } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ElectionDetail() {
  const { electionId } = useParams();
  const { student } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [ballotHash, setBallotHash] = useState('');
  const [showFullHash, setShowFullHash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const e = getElection(electionId);
    const c = getCandidates(electionId);
    setElection(e);
    setCandidates(c);

    // Already voted? Show receipt
    if (e && student && hasVoted(electionId, student.index_number)) {
      const receipt = getVoteReceipt(electionId, student.index_number);
      if (receipt) {
        setBallotHash(receipt.ballot_hash);
        setStep(4);
      }
    }
    setLoading(false);
  }, [electionId, student]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  const handleSubmitVote = async () => {
    setStep(3);
    await new Promise(r => setTimeout(r, 1800)); // Simulate network delay
    try {
      const hash = submitVote(electionId, selectedCandidateId, student.index_number);
      setBallotHash(hash);
      setStep(4);
    } catch (err) {
      toast.error(err.message);
      setStep(2);
    }
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="w-8 h-8 text-navy animate-spin" /></div>;
  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center font-body text-muted">Election not found.</div>;

  const STEPS = ['Choose', 'Review', 'Confirm'];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Header */}
      <header className="w-full bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center space-x-1 text-xs font-medium">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <span className={`px-3 py-1 ${step === i + 1 ? 'bg-navy text-surface' : step > i + 1 ? 'text-success' : 'text-muted'}`}>
                  {step > i + 1 ? '✓' : `${i + 1}.`} {s}
                </span>
                {i < STEPS.length - 1 && <span className="text-border">—</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <main className="w-full max-w-3xl mx-auto flex-1 px-4 py-10">

        {/* ── Step 1: Choose Candidate ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Link to="/vote" className="inline-flex items-center text-muted hover:text-navy text-sm font-medium mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to elections
            </Link>

            <h1 className="text-3xl font-display font-bold text-navy mb-1">{election.title}</h1>
            <p className="text-muted mb-8">Select your preferred candidate. You can only vote once.</p>

            <div className="space-y-4 mb-8">
              {candidates.map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`bg-surface border-2 p-6 cursor-pointer flex items-start justify-between transition-all group ${
                    selectedCandidateId === candidate.id
                      ? 'border-navy shadow-md'
                      : 'border-border hover:border-navy/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-display font-bold text-xl" style={{ backgroundColor: candidate.color }}>
                      {candidate.photo_url
                        ? <img src={candidate.photo_url} alt={candidate.full_name} className="w-full h-full object-cover" />
                        : candidate.initials
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-lg text-navy">{candidate.full_name}</h3>
                      <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">{candidate.position_title}</p>
                      <p className="text-sm text-muted leading-relaxed line-clamp-2">{candidate.manifesto}</p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 flex-shrink-0 ml-4 mt-1 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedCandidateId === candidate.id ? 'border-navy bg-navy' : 'border-border group-hover:border-navy/50'
                  }`}>
                    {selectedCandidateId === candidate.id && <CheckCircle className="w-4 h-4 text-surface" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedCandidateId}
              className="w-full bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              Continue to Review →
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-display font-bold text-navy mb-8 text-center">Review your vote</h1>

            <div className="bg-surface border border-border p-10 text-center mb-6">
              <p className="text-sm text-muted mb-6 uppercase tracking-wide font-bold">You are about to vote for</p>
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-3xl" style={{ backgroundColor: selectedCandidate.color }}>
                {selectedCandidate.photo_url
                  ? <img src={selectedCandidate.photo_url} alt={selectedCandidate.full_name} className="w-full h-full object-cover" />
                  : selectedCandidate.initials
                }
              </div>
              <h2 className="text-2xl font-display font-bold text-navy mb-1">{selectedCandidate.full_name}</h2>
              <p className="text-sm font-bold text-gold uppercase tracking-wider">{selectedCandidate.position_title}</p>
              <p className="text-sm text-muted mt-3 max-w-sm mx-auto">{selectedCandidate.manifesto}</p>
            </div>

            <div className="bg-warning/10 border border-warning/50 text-warning p-4 mb-8 text-center text-sm font-semibold">
              ⚠️ Once confirmed, your vote cannot be changed or reversed.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep(1)} className="bg-transparent text-navy border border-navy font-display font-medium py-4 hover:bg-navy-light transition-colors">
                ← Go Back
              </button>
              <button onClick={handleSubmitVote} className="bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors">
                Confirm My Vote
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Submitting ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-14 h-14 text-navy animate-spin mb-6" />
            <h2 className="text-xl font-display font-bold text-navy">Submitting your vote securely...</h2>
            <p className="text-muted mt-2">Encrypting ballot. Please do not close this page.</p>
          </div>
        )}

        {/* ── Step 4: Receipt ── */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center text-center">

            {/* The Ballot Seal */}
            <motion.div
              initial={{ scale: 0, opacity: 0.2, rotate: 15 }}
              animate={{ scale: [0, 1.08, 1], opacity: 1, rotate: [15, -4, 0] }}
              transition={{ duration: 0.55, times: [0, 0.65, 1], ease: 'easeOut' }}
              className="relative w-52 h-52 mb-10"
            >
              <div className="absolute inset-0 border-[7px] border-navy rounded-full flex flex-col items-center justify-center bg-surface shadow-lg">
                <CheckCircle className="w-8 h-8 text-success mb-1" />
                <span className="font-display font-bold text-2xl text-navy tracking-widest">VOTED</span>
                <span className="font-mono text-[9px] text-muted mt-1 px-3 text-center uppercase leading-tight max-w-[130px] break-words">
                  {election.title}
                </span>
              </div>
              {/* Outer dashed ring */}
              <div className="absolute inset-[-8px] border-[3px] border-dashed border-navy/30 rounded-full pointer-events-none"></div>
            </motion.div>

            <h1 className="text-3xl font-display font-bold text-navy mb-2">Your vote has been recorded!</h1>
            <p className="text-muted mb-10 max-w-md">Save this receipt hash. You can use it to verify your vote was counted without revealing who you voted for.</p>

            {/* Hash display */}
            <div className="bg-surface border border-border w-full p-6 text-left mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Ballot Receipt Hash (SHA-256)</span>
                <button onClick={() => setShowFullHash(!showFullHash)} className="text-navy flex items-center text-sm font-medium hover:underline">
                  {showFullHash ? <><EyeOff className="w-4 h-4 mr-1" /> Hide</> : <><Eye className="w-4 h-4 mr-1" /> Show full</>}
                </button>
              </div>
              <div className={`font-mono text-sm bg-navy-light p-4 text-navy select-all ${showFullHash ? 'break-all' : 'truncate'}`}>
                {ballotHash}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
              <button
                onClick={() => { navigator.clipboard.writeText(ballotHash); toast.success('Receipt copied!'); }}
                className="bg-surface border border-navy text-navy flex items-center justify-center font-display font-medium py-3 hover:bg-navy-light transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy Receipt
              </button>
              <button
                onClick={() => toast.success('Email sent to your registered address')}
                className="bg-surface border border-navy text-navy flex items-center justify-center font-display font-medium py-3 hover:bg-navy-light transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" /> Email to Myself
              </button>
            </div>

            <Link to="/vote" className="text-navy font-medium hover:underline">← Return to elections</Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
