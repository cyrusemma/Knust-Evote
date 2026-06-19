import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

// SIMULATION MODE — no backend needed
// Valid index numbers for the demo
const MOCK_USERS = {
  '0000001': { name: 'Electoral Commissioner', role: 'commissioner' },
  '1000001': { name: 'Ama Asante', role: 'voter' },
  '1000002': { name: 'Kwame Mensah', role: 'voter' },
  '1000003': { name: 'Akua Boateng', role: 'voter' },
  '1000004': { name: 'Kofi Amoah', role: 'voter' },
  '1000005': { name: 'Abena Osei', role: 'voter' },
  '1234567': { name: 'Test Voter', role: 'voter' },
};

export default function Login() {
  const [indexNumber, setIndexNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!indexNumber || indexNumber.length < 7) {
      setError('Please enter a valid 7-digit index number.');
      return;
    }

    if (!MOCK_USERS[indexNumber]) {
      setError('Index number not found or not eligible to vote. Try: 0000001 (Commissioner) or 1000001 (Voter)');
      return;
    }

    setLoading(true);
    // Simulate OTP being "sent" — 600ms delay
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);

    navigate('/verify-otp', { state: { indexNumber } });
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center font-body p-4">
      <div className="mb-8 flex flex-col items-center">
        <Shield className="w-12 h-12 text-gold mb-3" />
        <span className="text-2xl font-display font-bold text-surface">KNUSTVote</span>
        <span className="text-xs text-navy-light mt-1 uppercase tracking-widest font-medium">Simulation Mode</span>
      </div>

      <div className="bg-surface border border-border w-full max-w-md p-8 shadow-xl">
        <h1 className="text-2xl font-display font-bold text-navy mb-1">Enter your index number</h1>
        <p className="text-muted text-sm mb-6">Use your KNUST student index number (e.g. 1000001)</p>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger p-3 mb-5 flex items-start space-x-2 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            id="indexNumber"
            type="text"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
            placeholder="1234567"
            className="w-full border border-border px-4 py-3 font-mono text-xl text-center focus:outline-none focus:ring-2 focus:ring-navy tracking-[0.4em] placeholder:tracking-normal placeholder:text-muted/40"
            autoFocus
            maxLength={7}
          />

          <button
            type="submit"
            disabled={loading || indexNumber.length < 7}
            className="w-full bg-navy text-surface font-display font-semibold py-3 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Sending OTP...' : 'Send OTP →'}
          </button>
        </form>

        {/* Demo hint panel */}
        <div className="mt-6 bg-navy-light border border-border p-4">
          <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Demo Accounts</p>
          <div className="space-y-1 text-xs text-muted font-mono">
            <div className="flex justify-between"><span>0000001</span><span className="text-gold font-bold">Commissioner</span></div>
            <div className="flex justify-between"><span>1000001 – 1000005</span><span className="text-navy font-bold">Voter</span></div>
            <div className="flex justify-between"><span>1234567</span><span className="text-navy font-bold">Voter</span></div>
          </div>
          <p className="text-xs text-muted mt-2">OTP code: <span className="font-mono font-bold text-navy">123456</span></p>
        </div>
      </div>

      <p className="mt-8 text-navy-light text-xs">
        Having trouble? <a href="#" className="underline hover:text-surface">Contact the Electoral Commissioner</a>
      </p>
    </div>
  );
}
