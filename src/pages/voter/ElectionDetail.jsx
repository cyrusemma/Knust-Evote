import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft, Loader2, Copy, Mail, Eye, EyeOff, ChevronRight, ThumbsUp, ThumbsDown, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCandidates, getElection, hasVoted, submitVote, getVoteReceipt,
  submitUnopposedVote, isElectionUnopposed, getPendingElections
} from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0, filter: 'blur(4px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (direction) => ({ x: direction < 0 ? 60 : -60, opacity: 0, filter: 'blur(4px)' }),
};

export default function ElectionDetail() {
  const { electionId } = useParams();
  const { student } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [unopposedVote, setUnopposedVote] = useState(null); // 'yes' | 'no'
  const [ballotHash, setBallotHash] = useState('');
  const [showFullHash, setShowFullHash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

  // Multi-position: what's next after this one?
  const [nextElections, setNextElections] = useState([]);

  const isUnopposed = isElectionUnopposed(electionId);

  useEffect(() => {
    const e = getElection(electionId);
    const c = getCandidates(electionId);
    setElection(e);
    setCandidates(c);

    if (e && student && hasVoted(electionId, student.index_number)) {
      const receipt = getVoteReceipt(electionId, student.index_number);
      if (receipt) {
        setBallotHash(receipt.ballot_hash);
        setStep(4);
      }
    }
    setLoading(false);

    // Load remaining positions AFTER this one
    if (student) {
      const pending = getPendingElections(student.index_number).filter(el => el.id !== electionId);
      setNextElections(pending);
    }
  }, [electionId, student]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  const unopposedCandidate = isUnopposed ? candidates[0] : null;

  const handleSubmitVote = async () => {
    setDirection(1);
    setStep(3);
    await new Promise(r => setTimeout(r, 1800));
    try {
      let hash;
      if (isUnopposed && unopposedCandidate) {
        hash = submitUnopposedVote(electionId, unopposedCandidate.id, student.index_number, unopposedVote);
      } else {
        hash = submitVote(electionId, selectedCandidateId, student.index_number);
      }
      setBallotHash(hash);
      // Reload next elections after voting
      const pending = getPendingElections(student.index_number).filter(el => el.id !== electionId);
      setNextElections(pending);
      setStep(4);
    } catch (err) {
      toast.error(err.message);
      setStep(2);
    }
  };

  const goToStep = (s, dir = 1) => {
    setDirection(dir);
    setStep(s);
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="w-8 h-8 text-navy animate-spin" /></div>;
  if (!election) return <div className="min-h-screen bg-bg flex items-center justify-center font-body text-muted">Election not found.</div>;

  const STEPS = isUnopposed ? ['Confidence Vote', 'Review', 'Confirm'] : ['Choose', 'Review', 'Confirm'];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="w-full bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </div>
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

      <main className="w-full max-w-3xl mx-auto flex-1 px-4 py-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── Step 1: Choose / YES-NO ── */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>

              <Link to="/vote" className="inline-flex items-center text-muted hover:text-navy text-sm font-medium mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to elections
              </Link>

              <h1 className="text-3xl font-display font-bold text-navy mb-1">{election.title}</h1>

              {isUnopposed ? (
                <>
                  <p className="text-muted mb-8 text-sm">This position has a single candidate running unopposed. Cast your confidence vote below.</p>

                  {/* Unopposed candidate profile */}
                  <div className="bg-surface border border-border p-8 text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-3xl overflow-hidden"
                      style={{ backgroundColor: unopposedCandidate?.color }}>
                      {unopposedCandidate?.photo_url
                        ? <img src={unopposedCandidate.photo_url} alt={unopposedCandidate.full_name} className="w-full h-full object-cover" />
                        : unopposedCandidate?.initials
                      }
                    </div>
                    <h2 className="text-2xl font-display font-bold text-navy mb-1">{unopposedCandidate?.full_name}</h2>
                    <p className="text-xs font-bold text-gold uppercase tracking-wider mb-3">{unopposedCandidate?.position_title}</p>
                    {unopposedCandidate?.manifesto && <p className="text-sm text-muted max-w-sm mx-auto">{unopposedCandidate.manifesto}</p>}
                  </div>

                  <p className="text-center text-sm font-bold text-muted uppercase tracking-widest mb-4">Do you support this candidate?</p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={() => setUnopposedVote('yes')}
                      className={`border-2 p-6 font-display font-bold text-xl flex flex-col items-center gap-2 transition-all ${unopposedVote === 'yes' ? 'border-success bg-success/5 text-success' : 'border-border text-muted hover:border-success/40'}`}
                    >
                      <ThumbsUp className={`w-8 h-8 ${unopposedVote === 'yes' ? 'text-success' : 'text-muted'}`} />
                      YES
                    </button>
                    <button
                      onClick={() => setUnopposedVote('no')}
                      className={`border-2 p-6 font-display font-bold text-xl flex flex-col items-center gap-2 transition-all ${unopposedVote === 'no' ? 'border-danger bg-danger/5 text-danger' : 'border-border text-muted hover:border-danger/40'}`}
                    >
                      <ThumbsDown className={`w-8 h-8 ${unopposedVote === 'no' ? 'text-danger' : 'text-muted'}`} />
                      NO
                    </button>
                  </div>

                  <button
                    onClick={() => goToStep(2)}
                    disabled={!unopposedVote}
                    className="w-full bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                  >
                    Continue to Review →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted mb-8">Select your preferred candidate. You can only vote once.</p>
                  <div className="space-y-4 mb-8">
                    {candidates.map(candidate => (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className={`bg-surface border-2 p-6 cursor-pointer flex items-start justify-between transition-all group ${
                          selectedCandidateId === candidate.id ? 'border-navy shadow-md' : 'border-border hover:border-navy/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-display font-bold text-xl overflow-hidden" style={{ backgroundColor: candidate.color }}>
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
                    onClick={() => goToStep(2)}
                    disabled={!selectedCandidateId}
                    className="w-full bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                  >
                    Continue to Review →
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>

              <h1 className="text-2xl font-display font-bold text-navy mb-8 text-center">Review your vote</h1>

              <div className="bg-surface border border-border p-10 text-center mb-6">
                {isUnopposed ? (
                  <>
                    <p className="text-sm text-muted mb-4 uppercase tracking-wide font-bold">Your confidence vote for</p>
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-3xl overflow-hidden"
                      style={{ backgroundColor: unopposedCandidate?.color }}>
                      {unopposedCandidate?.photo_url
                        ? <img src={unopposedCandidate.photo_url} alt={unopposedCandidate.full_name} className="w-full h-full object-cover" />
                        : unopposedCandidate?.initials
                      }
                    </div>
                    <h2 className="text-2xl font-display font-bold text-navy mb-1">{unopposedCandidate?.full_name}</h2>
                    <p className="text-sm font-bold text-gold uppercase tracking-wider mb-4">{unopposedCandidate?.position_title}</p>
                    <div className={`inline-flex items-center gap-2 px-8 py-3 font-display font-bold text-2xl border-2 ${
                      unopposedVote === 'yes' ? 'border-success text-success bg-success/5' : 'border-danger text-danger bg-danger/5'
                    }`}>
                      {unopposedVote === 'yes' ? <ThumbsUp className="w-6 h-6" /> : <ThumbsDown className="w-6 h-6" />}
                      {unopposedVote?.toUpperCase()}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted mb-6 uppercase tracking-wide font-bold">You are about to vote for</p>
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-3xl overflow-hidden" style={{ backgroundColor: selectedCandidate?.color }}>
                      {selectedCandidate?.photo_url
                        ? <img src={selectedCandidate.photo_url} alt={selectedCandidate.full_name} className="w-full h-full object-cover" />
                        : selectedCandidate?.initials
                      }
                    </div>
                    <h2 className="text-2xl font-display font-bold text-navy mb-1">{selectedCandidate?.full_name}</h2>
                    <p className="text-sm font-bold text-gold uppercase tracking-wider">{selectedCandidate?.position_title}</p>
                    <p className="text-sm text-muted mt-3 max-w-sm mx-auto">{selectedCandidate?.manifesto}</p>
                  </>
                )}
              </div>

              <div className="bg-warning/10 border border-warning/50 text-warning p-4 mb-8 text-center text-sm font-semibold">
                ⚠️ Once confirmed, your vote cannot be changed or reversed.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => goToStep(1, -1)} className="bg-transparent text-navy border border-navy font-display font-medium py-4 hover:bg-navy-light transition-colors">
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
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-14 h-14 text-navy animate-spin mb-6" />
              <h2 className="text-xl font-display font-bold text-navy">Submitting your vote securely...</h2>
              <p className="text-muted mt-2">Encrypting ballot. Please do not close this page.</p>
            </motion.div>
          )}

          {/* ── Step 4: Receipt + Next Position ── */}
          {step === 4 && (
            <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center text-center">

              {/* Ballot Seal */}
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
                <div className="absolute inset-[-8px] border-[3px] border-dashed border-navy/30 rounded-full pointer-events-none"></div>
              </motion.div>

              <h1 className="text-3xl font-display font-bold text-navy mb-2">Your vote has been recorded!</h1>
              <p className="text-muted mb-8 max-w-md">Save this receipt hash. You can use it to verify your vote was counted without revealing who you voted for.</p>

              {/* Hash display */}
              <div className="bg-surface border border-border w-full p-6 text-left mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Ballot Receipt Hash (SHA-256)</span>
                  <button onClick={() => setShowFullHash(!showFullHash)} className="text-navy flex items-center text-sm font-medium hover:underline">
                    {showFullHash ? <><EyeOff className="w-4 h-4 mr-1" />Hide</> : <><Eye className="w-4 h-4 mr-1" />Show full</>}
                  </button>
                </div>
                <div className={`font-mono text-sm bg-navy-light p-4 text-navy select-all ${showFullHash ? 'break-all' : 'truncate'}`}>
                  {ballotHash}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
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

              {/* Next position button — the star of the show */}
              {nextElections.length > 0 ? (
                <div className="w-full bg-navy-light border-2 border-navy p-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-5 h-5 text-navy" />
                    <p className="font-display font-bold text-navy text-sm uppercase tracking-wide">
                      {nextElections.length} more position{nextElections.length > 1 ? 's' : ''} to vote in
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {nextElections.map((el, i) => (
                      <div key={el.id} className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-5 h-5 bg-navy text-surface text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        {el.title}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/vote/${nextElections[0].id}`)}
                    className="w-full bg-navy text-surface font-display font-bold py-4 hover:bg-navy-dark transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    Next Position: {nextElections[0].title}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-full bg-success/10 border border-success p-5 mb-4 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-display font-bold text-success text-sm">You have voted in all open positions!</p>
                </div>
              )}

              <Link to="/vote" className="text-navy font-medium hover:underline text-sm">
                ← Return to elections overview
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
