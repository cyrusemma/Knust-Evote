import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ThemeToggle from './components/ThemeToggle'
import PageTransition from './components/PageTransition'
import { AnimatePresence } from 'framer-motion'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import VerifyOTP from './pages/auth/VerifyOTP'
import VoterDashboard from './pages/voter/Dashboard'
import ElectionDetail from './pages/voter/ElectionDetail'
import MyVotes from './pages/voter/MyVotes'
import CommissionerDashboard from './pages/commissioner/Dashboard'
import CreateElection from './pages/commissioner/CreateElection'
import ManageCandidates from './pages/commissioner/ManageCandidates'
import Results from './pages/public/Results'
import VerifyReceipt from './pages/public/VerifyReceipt'
import LiveMonitor from './pages/commissioner/LiveMonitor'
import AuditLog from './pages/commissioner/AuditLog'

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/results/:electionId" element={<PageTransition><Results /></PageTransition>} />
        <Route path="/verify" element={<PageTransition><VerifyReceipt /></PageTransition>} />

        {/* Auth */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/verify-otp" element={<PageTransition><VerifyOTP /></PageTransition>} />

        {/* Voter — requires role: voter or above */}
        <Route element={<ProtectedRoute role="voter" />}>
          <Route path="/vote" element={<PageTransition><VoterDashboard /></PageTransition>} />
          <Route path="/vote/:electionId" element={<PageTransition><ElectionDetail /></PageTransition>} />
          <Route path="/vote/my-receipts" element={<PageTransition><MyVotes /></PageTransition>} />
        </Route>

        {/* Commissioner — requires role: commissioner or admin */}
        <Route element={<ProtectedRoute role="commissioner" />}>
          <Route path="/commissioner" element={<PageTransition><CommissionerDashboard /></PageTransition>} />
          <Route path="/commissioner/elections/new" element={<PageTransition><CreateElection /></PageTransition>} />
          <Route path="/commissioner/elections/:id/candidates" element={<PageTransition><ManageCandidates /></PageTransition>} />
          <Route path="/commissioner/elections/:id/monitor" element={<PageTransition><LiveMonitor /></PageTransition>} />
          <Route path="/commissioner/elections/:id/audit" element={<PageTransition><AuditLog /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnimatedRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '0px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: { primary: '#16A34A', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: '#DC2626', secondary: 'white' },
              },
            }}
          />
          {/* ThemeToggle self-positions as fixed */}
          <ThemeToggle />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
