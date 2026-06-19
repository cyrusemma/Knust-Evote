import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, CheckCircle, Shield, FileSignature, Activity, Lock, ChevronRight, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Lock, title: 'Two-factor verification', desc: 'Authenticate securely using your index number combined with an OTP sent to your KNUST email.' },
  { icon: FileSignature, title: 'Cryptographic receipts', desc: 'Every ballot gets a unique SHA-256 hash ensuring it is securely counted and untampered.' },
  { icon: Shield, title: 'Tamper-evident audit', desc: 'The complete election record is sealed and publicly verifiable by anyone independently.' },
  { icon: Activity, title: 'Real-time anomaly detection', desc: 'Suspicious patterns like bot-speed voting or rapid OTP requests are flagged instantly.' },
];

const steps = [
  { icon: KeyRound, step: '01', title: 'Enter your index number', desc: 'Start securely using your official KNUST student index number.' },
  { icon: ShieldCheck, step: '02', title: 'Verify with your OTP', desc: 'A one-time code is sent to your registered KNUST email.' },
  { icon: CheckCircle, step: '03', title: 'Cast ballot & get receipt', desc: 'Vote and receive a cryptographic hash to verify your ballot anytime.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border py-4 px-8 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <Shield className="w-7 h-7 text-navy" />
          <span className="text-xl font-display font-bold text-navy">KNUSTVote</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/verify" className="px-4 py-2 font-display font-medium text-muted hover:text-navy transition-colors text-sm hidden sm:block">
            Verify Receipt
          </Link>
          <Link to="/login" className="px-5 py-2 font-display font-semibold text-surface bg-navy hover:bg-navy-dark transition-colors text-sm">
            Log In →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="md:w-1/2 space-y-6"
        >
          <div className="inline-flex items-center bg-navy-light text-navy px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
            🏛 KNUST Student Electoral Commission
          </div>
          <h1 className="text-5xl font-display font-bold text-navy leading-tight">
            Student Elections.<br />Secure. Verified.<br />
            <span className="text-gold">From Anywhere.</span>
          </h1>
          <p className="text-lg text-muted max-w-md leading-relaxed">
            Vote using your index number from your phone, laptop, or tablet. Your ballot is cryptographically sealed — no one can change it after submission.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/login" className="px-7 py-3 bg-navy text-surface font-display font-semibold hover:bg-navy-dark transition-colors flex items-center gap-2">
              Vote Now <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/results/e3" className="px-7 py-3 text-navy font-display font-semibold border border-navy hover:bg-navy-light transition-colors flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> View Results
            </Link>
          </div>
        </motion.div>

        {/* Animated ballot preview card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="md:w-1/2 flex justify-center"
        >
          <div className="relative w-80 shadow-2xl">
            {/* Card */}
            <div className="bg-surface border border-border p-6">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-navy" />
                  <span className="font-display font-bold text-navy text-sm">Official Ballot</span>
                </div>
                <span className="text-xs bg-warning/10 text-warning font-bold px-2 py-0.5 uppercase">Open</span>
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">SRC Presidential Election</p>

              {/* Fake candidates */}
              {[
                { initials: 'KM', name: 'Kwame Mensah', color: '#1A3A6B' },
                { initials: 'AA', name: 'Akosua Agyemang', color: '#B8860B' },
                { initials: 'EB', name: 'Emmanuel Boateng', color: '#16A34A' },
              ].map((c, i) => (
                <div key={c.initials}
                  className={`flex items-center gap-3 p-3 border-2 mb-2 cursor-pointer transition-all ${i === 0 ? 'border-navy bg-navy-light' : 'border-border hover:border-navy/30'}`}>
                  <div className="w-9 h-9 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>
                    {c.initials}
                  </div>
                  <span className="font-display font-semibold text-navy text-sm">{c.name}</span>
                  {i === 0 && <CheckCircle className="w-4 h-4 text-navy ml-auto" />}
                </div>
              ))}

              <button className="mt-3 w-full bg-navy text-surface font-display font-bold py-3 text-sm">
                Continue to Review →
              </button>
            </div>

            {/* Hash receipt tag */}
            <div className="absolute -bottom-4 -right-4 bg-navy text-surface p-3 font-mono text-[10px] shadow-lg max-w-[180px] break-all leading-tight">
              SHA256: 8f434346648f6b96df89…
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy py-8">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '12,000+', label: 'Registered Voters' },
            { value: '99.9%', label: 'Uptime Guarantee' },
            { value: '0', label: 'Tampering Incidents' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-display font-bold text-gold">{value}</p>
              <p className="text-xs text-navy-light uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-display font-bold text-navy text-center mb-2">How it works</h2>
          <p className="text-center text-muted mb-12 text-sm">Three simple steps. Less than 2 minutes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-navy-light flex items-center justify-center">
                    <Icon className="w-8 h-8 text-navy" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-navy text-surface text-xs font-bold w-6 h-6 flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-navy">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security features */}
      <section className="py-20 max-w-7xl mx-auto px-8 w-full">
        <h2 className="text-3xl font-display font-bold text-navy text-center mb-2">Built for integrity</h2>
        <p className="text-center text-muted mb-12 text-sm">Every layer of the system is designed to be transparent and tamper-proof.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border p-8 flex space-x-6 hover:border-navy/30 transition-colors group">
              <div className="w-12 h-12 bg-navy-light flex items-center justify-center flex-shrink-0 group-hover:bg-navy transition-colors">
                <Icon className="w-6 h-6 text-navy group-hover:text-surface transition-colors" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-navy mb-2">{title}</h4>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 text-center">
        <h2 className="text-3xl font-display font-bold text-surface mb-3">Ready to cast your ballot?</h2>
        <p className="text-navy-light mb-8 text-sm">Your vote matters. It takes less than 2 minutes.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy font-display font-bold hover:bg-gold/90 transition-colors text-base">
          Get Started <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-surface font-display font-bold text-xl">KNUSTVote</span>
          <div className="text-navy-light text-sm flex space-x-6 items-center">
            <Link to="/verify" className="hover:text-surface transition-colors">Verify Receipt</Link>
            <a href="https://github.com/cyrusemma/Knust-Evote" target="_blank" rel="noreferrer" className="hover:text-surface transition-colors">GitHub</a>
            <span>© {new Date().getFullYear()} KNUST Electoral Commission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
