import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TwoFactorPage from './pages/TwoFactorPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import KPITracker from './pages/KPITracker'
import DeliverablesTracker from './pages/DeliverablesTracker'
import AuditLog from './pages/AuditLog'
import PendingApprovalPage from './pages/PendingApprovalPage'
import ErrorBoundary from './components/ErrorBoundary'
import { isUserApproved } from './services/userService'

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Check if user is approved
  if (userProfile && !isUserApproved(userProfile)) {
    return <PendingApprovalPage userProfile={userProfile} />
  }

  // If userProfile is still loading, show loading
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (adminOnly && user.email !== 'hussein.srour@thakralone.com') {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-2fa" element={<TwoFactorPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/kpi-tracker"
              element={
                <PrivateRoute>
                  <KPITracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/deliverables-tracker"
              element={
                <PrivateRoute>
                  <DeliverablesTracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/audit-log"
              element={
                <PrivateRoute adminOnly={true}>
                  <AuditLog />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
