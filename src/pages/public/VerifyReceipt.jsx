import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileSearch, CheckCircle, XCircle, Search } from 'lucide-react';
import { verifyBallotHash } from '../../lib/mockData';

export default function VerifyReceipt() {
  const [hash, setHash] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (!hash.trim() || hash.trim().length < 10) {
      setStatus('error');
      setErrorMsg('Please enter a valid ballot receipt hash.');
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      if (verifyBallotHash(hash.trim())) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('No matching vote found for this receipt hash. Ensure you are using the exact hash from your receipt.');
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-surface border border-border p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-light flex items-center justify-center rounded-full">
              <FileSearch className="w-8 h-8 text-navy" />
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-navy text-center mb-4">Verify Your Vote</h1>
          <p className="text-muted text-center mb-8 max-w-md mx-auto text-sm">
            Paste the SHA-256 receipt hash you received after voting. This confirms your ballot is recorded — without revealing who you voted for.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <textarea
              id="hash"
              rows="3"
              value={hash}
              onChange={(e) => { setHash(e.target.value); setStatus('idle'); }}
              placeholder="Paste your 64-character ballot hash here..."
              className="w-full border border-border p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-navy bg-bg resize-none"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !hash.trim()}
              className="w-full bg-navy text-surface font-display font-semibold py-4 hover:bg-navy-dark transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {status === 'loading'
                ? 'Checking audit ledger...'
                : <><Search className="w-5 h-5 mr-2" /> Verify Hash</>
              }
            </button>
          </form>

          {status === 'success' && (
            <div className="mt-6 bg-success/10 border border-success p-6 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
              <h3 className="text-xl font-display font-bold text-success mb-2">Vote Confirmed ✓</h3>
              <p className="text-success text-sm">Your ballot is cryptographically verified and recorded in the tamper-evident audit log. It will be counted in the final tally.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 bg-danger/10 border border-danger p-6 text-center">
              <XCircle className="w-12 h-12 text-danger mx-auto mb-2" />
              <h3 className="text-xl font-display font-bold text-danger mb-2">Not Found</h3>
              <p className="text-danger text-sm">{errorMsg}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
