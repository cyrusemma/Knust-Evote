import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Public
import Landing from './pages/Landing'
import Results from './pages/public/Results'
import VerifyReceipt from './pages/public/VerifyReceipt'

// Auth
import Login from './pages/auth/Login'
import VerifyOTP from './pages/auth/VerifyOTP'

// Voter
import VoterDashboard from './pages/voter/Dashboard'
import ElectionDetail from './pages/voter/ElectionDetail'
import MyVotes from './pages/voter/MyVotes'

// Commissioner
import CommissionerDashboard from './pages/commissioner/Dashboard'
import CreateElection from './pages/commissioner/CreateElection'
import ManageCandidates from './pages/commissioner/ManageCandidates'
import LiveMonitor from './pages/commissioner/LiveMonitor'
import AuditLog from './pages/commissioner/AuditLog'

import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/results/:electionId" element={<Results />} />
            <Route path="/verify" element={<VerifyReceipt />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Voter — requires role: voter or above */}
            <Route element={<ProtectedRoute role="voter" />}>
              <Route path="/vote" element={<VoterDashboard />} />
              <Route path="/vote/:electionId" element={<ElectionDetail />} />
              <Route path="/vote/my-receipts" element={<MyVotes />} />
            </Route>

            {/* Commissioner — requires role: commissioner or admin */}
            <Route element={<ProtectedRoute role="commissioner" />}>
              <Route path="/commissioner" element={<CommissionerDashboard />} />
              <Route path="/commissioner/elections/new" element={<CreateElection />} />
              <Route path="/commissioner/elections/:id/candidates" element={<ManageCandidates />} />
              <Route path="/commissioner/elections/:id/monitor" element={<LiveMonitor />} />
              <Route path="/commissioner/elections/:id/audit" element={<AuditLog />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
          
          {/* Floating Theme Toggle for the Demo */}
          <div className="fixed bottom-4 right-4 z-50 bg-surface border border-border shadow-lg p-1">
            <ThemeToggle />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
