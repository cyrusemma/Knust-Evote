import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_OTP = '123456';

const MOCK_USERS = {
  '0000001': { name: 'Electoral Commissioner', role: 'commissioner' },
  '1000001': { name: 'Ama Asante', role: 'voter' },
  '1000002': { name: 'Kwame Mensah', role: 'voter' },
  '1000003': { name: 'Akua Boateng', role: 'voter' },
  '1000004': { name: 'Kofi Amoah', role: 'voter' },
  '1000005': { name: 'Abena Osei', role: 'voter' },
  '1234567': { name: 'Test Voter', role: 'voter' },
};

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const indexNumber = location.state?.indexNumber;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!indexNumber) navigate('/login');
    else inputRefs.current[0]?.focus();
  }, [indexNumber, navigate]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Resend cooldown
  useEffect(() => {
    const t = setInterval(() => setResendCooldown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError('');
    if (idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) verifyCode(next.join(''));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...otp];
      next[idx] = '';
      setOtp(next);
      if (idx > 0) inputRefs.current[idx - 1]?.focus();
    }
  };

  const verifyCode = async (code) => {
    setLoading(true);
    // Simulate 1 second verification delay
    await new Promise(r => setTimeout(r, 1000));

    if (code !== MOCK_OTP) {
      setError('Invalid code. The demo OTP is 123456.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Success — store in localStorage and navigate
    localStorage.setItem('mock_index', indexNumber);
    const user = MOCK_USERS[indexNumber];

    if (user?.role === 'commissioner') {
      window.location.href = '/commissioner';
    } else {
      window.location.href = '/vote';
    }
  };

  const handleResend = () => {
    setResendCooldown(60);
    setTimeLeft(600);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  if (!indexNumber) return null;

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center font-body p-4">
      <div className="mb-8 flex flex-col items-center">
        <Shield className="w-12 h-12 text-gold mb-3" />
        <span className="text-2xl font-display font-bold text-surface">KNUSTVote</span>
        <span className="text-xs text-navy-light mt-1 uppercase tracking-widest font-medium">Simulation Mode</span>
      </div>

      <div className="bg-surface border border-border w-full max-w-md p-8 shadow-xl">
        <h1 className="text-2xl font-display font-bold text-navy mb-1">Verify your identity</h1>
        <p className="text-muted text-sm mb-2">
          Enter the 6-digit code sent to your registered email.
        </p>
        <p className="text-xs bg-navy-light text-navy px-3 py-2 mb-6 font-mono font-bold inline-block">
          Index: {indexNumber} — Demo OTP: 123456
        </p>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger p-3 mb-5 flex items-start space-x-2 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* OTP input boxes */}
          <motion.div
            className="flex justify-between space-x-2"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                disabled={loading || timeLeft === 0}
                className={`w-12 h-14 text-center font-mono text-2xl font-bold border-2 focus:outline-none transition-all
                  ${error ? 'border-danger bg-danger/5' : digit ? 'border-navy bg-navy-light' : 'border-border'}
                  focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-50`}
              />
            ))}
          </motion.div>

          {/* Timer + resend */}
          <div className="flex justify-between items-center text-xs">
            {timeLeft > 0 ? (
              <span className={timeLeft < 120 ? 'text-danger font-bold' : 'text-muted'}>
                Expires in {formatTime(timeLeft)}
              </span>
            ) : (
              <span className="text-danger font-bold">Code expired</span>
            )}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={resendCooldown > 0 ? 'text-muted cursor-not-allowed' : 'text-navy font-bold hover:underline'}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>

          {loading && (
            <div className="text-center text-sm text-muted animate-pulse">Verifying...</div>
          )}
        </div>
      </div>
    </div>
  );
}
