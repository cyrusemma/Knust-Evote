import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, CheckCircle, Shield, FileSignature, Activity, Lock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-navy" />
          <span className="text-xl font-display font-bold text-navy">KNUSTVote</span>
        </div>
        <div className="flex space-x-4">
          <Link to="/login" className="px-4 py-2 font-display font-medium text-navy border border-border bg-surface hover:bg-navy-light transition-colors">Log In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto flex-1">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-display font-bold text-navy leading-tight">
            KNUST Student Elections.<br />Secure. Verified.<br />From Anywhere.
          </h1>
          <p className="text-lg text-muted max-w-lg">
            Vote using your index number from your phone, laptop, or tablet. Your ballot is cryptographically sealed — no one can change it.
          </p>
          <div className="flex space-x-4 pt-4">
            <Link to="/login" className="px-6 py-3 bg-navy text-surface font-display font-medium hover:bg-navy-dark transition-colors">
              Vote Now
            </Link>
            <Link to="/results/latest" className="px-6 py-3 text-navy font-display font-medium hover:underline">
              View Results
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
          <div className="relative w-80 h-96 bg-surface border border-border shadow-sm flex flex-col items-center justify-center p-6">
            <div className="w-full h-4 bg-navy-light mb-8"></div>
            <div className="w-full h-4 bg-navy-light mb-8"></div>
            <div className="w-full h-4 bg-navy-light mb-8"></div>
            <div className="w-full h-4 bg-navy-light mb-8"></div>
            <div className="absolute -bottom-6 -right-6 bg-navy text-surface p-4 font-mono text-xs shadow-lg max-w-xs break-all">
              SHA256: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-display font-bold text-navy text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy">Enter your index number</h3>
              <p className="text-muted">Start the process securely using your official KNUST student index number.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy">Verify with your OTP</h3>
              <p className="text-muted">Receive a one-time password to your registered phone or student email.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy">Cast your ballot, get your receipt</h3>
              <p className="text-muted">Submit your vote and receive a unique cryptographic hash to verify it later.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 max-w-7xl mx-auto px-8">
        <h2 className="text-3xl font-display font-bold text-navy text-center mb-12">Built for integrity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border p-8 flex space-x-6">
            <Lock className="w-10 h-10 text-navy flex-shrink-0" />
            <div>
              <h4 className="font-display font-bold text-lg text-navy mb-2">Two-factor verification</h4>
              <p className="text-muted">Authenticate securely using your index number combined with an OTP sent to your KNUST email.</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-8 flex space-x-6">
            <FileSignature className="w-10 h-10 text-navy flex-shrink-0" />
            <div>
              <h4 className="font-display font-bold text-lg text-navy mb-2">Cryptographic receipts</h4>
              <p className="text-muted">Every ballot gets a unique verification hash ensuring it is securely counted and untampered.</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-8 flex space-x-6">
            <Shield className="w-10 h-10 text-navy flex-shrink-0" />
            <div>
              <h4 className="font-display font-bold text-lg text-navy mb-2">Tamper-evident audit</h4>
              <p className="text-muted">The complete election record is publicly verifiable by anyone independently.</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-8 flex space-x-6">
            <Activity className="w-10 h-10 text-navy flex-shrink-0" />
            <div>
              <h4 className="font-display font-bold text-lg text-navy mb-2">Anomaly detection</h4>
              <p className="text-muted">Suspicious patterns like bot-speed voting or rapid requests are flagged in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark py-8 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <span className="text-surface font-display font-bold text-xl mb-4 md:mb-0">KNUSTVote</span>
          <div className="text-navy-light text-sm flex space-x-6 items-center">
            <span>CSM 366 Mini Project</span>
            <a href="#" className="hover:text-surface transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
