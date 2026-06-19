import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, FileText, ArrowLeft } from 'lucide-react';
import { getAllVotes, getElections } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';

export default function MyVotes() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [myReceipts, setMyReceipts] = useState([]);

  useEffect(() => {
    const votes = getAllVotes().filter(v => v.voter_index === student?.index_number);
    const elections = getElections();
    const enriched = votes.map(v => ({
      ...v,
      election: elections.find(e => e.id === v.election_id),
    }));
    setMyReceipts(enriched);
  }, [student]);

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      <header className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-navy" />
          <span className="text-lg font-display font-bold text-navy">KNUSTVote</span>
        </div>
        <Link to="/vote" className="text-sm font-medium text-navy hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Elections
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-display font-bold text-navy mb-2">My Voting Receipts</h1>
        <p className="text-muted mb-8 text-sm">Each receipt contains a unique cryptographic hash confirming your vote was securely recorded.</p>

        {myReceipts.length === 0 ? (
          <div className="bg-surface border border-border p-16 text-center">
            <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="font-display font-bold text-navy text-lg mb-2">No receipts yet</h3>
            <p className="text-muted text-sm mb-6">You haven't cast a ballot in any election yet.</p>
            <Link to="/vote" className="bg-navy text-surface font-display font-medium px-6 py-3 hover:bg-navy-dark transition-colors">
              View Open Elections →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {myReceipts.map(receipt => (
              <div key={receipt.ballot_hash} className="bg-surface border border-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-navy text-lg">{receipt.election?.title}</h3>
                    <p className="text-xs text-muted">{new Date(receipt.submitted_at).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success uppercase tracking-wide">✓ Voted</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Ballot Receipt Hash</p>
                  <div className="bg-navy-light p-3 font-mono text-xs text-navy break-all select-all">{receipt.ballot_hash}</div>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(receipt.ballot_hash); }}
                    className="text-xs font-bold px-3 py-2 border border-border text-navy hover:bg-navy-light transition-colors"
                  >
                    Copy Hash
                  </button>
                  <Link to="/verify" className="text-xs font-bold px-3 py-2 border border-border text-navy hover:bg-navy-light transition-colors">
                    Verify →
                  </Link>
                  {receipt.election?.status === 'closed' && (
                    <Link to={`/results/${receipt.election.id}`} className="text-xs font-bold px-3 py-2 bg-navy text-surface hover:bg-navy-dark transition-colors">
                      View Results →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
