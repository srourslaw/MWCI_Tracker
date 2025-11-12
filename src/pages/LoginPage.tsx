import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogIn, Mail, Lock, AlertCircle, CheckCircle, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { getUserProfile } from '../services/userService'
import { createTwoFactorCode, send2FACodeEmail } from '../services/twoFactorService'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { logger } from '../utils/logger'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check if user just verified their email and force reload auth state
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setVerificationSuccess(true)
      logger.log('🔄 User returned from email verification link')

      // Force reload current user to get latest verification status
      const checkAndRedirect = async () => {
        if (auth.currentUser) {
          logger.log('👤 User is logged in, reloading auth state...')
          try {
            // Force reload to get latest emailVerified status from Firebase
            await auth.currentUser.reload()
            logger.log('✅ Auth state reloaded')

            // Check if now verified
            if (auth.currentUser.emailVerified) {
              logger.log('✨ Email is now verified! Redirecting to dashboard...')

              // Wait 2 seconds to show success message, then redirect
              setTimeout(() => {
                if (auth.currentUser?.email === 'hussein.srour@thakralone.com') {
                  logger.log('🔐 Admin user detected, redirecting to /admin')
                  navigate('/admin')
                } else {
                  logger.log('👥 Regular user, redirecting to /dashboard')
                  navigate('/dashboard')
                }
              }, 2000)
            } else {
              logger.log('⚠️ Email still not verified after reload')
            }
          } catch (error) {
            logger.error('❌ Error reloading user:', error)
          }
        } else {
          logger.log('👻 No user logged in, user needs to sign in first')
        }
      }

      checkAndRedirect()
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)

      // Check if user has 2FA enabled
      const currentUser = auth.currentUser
      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.uid)

        if (userProfile?.twoFactorEnabled) {
          // Generate and send 2FA code
          const code = await createTwoFactorCode(currentUser.uid, email)
          await send2FACodeEmail(email, code, userProfile.displayName || 'User')

          logger.log('2FA required for user:', email)

          // Navigate to 2FA verification page
          navigate('/verify-2fa', {
            state: {
              email,
              userId: currentUser.uid,
              userName: userProfile.displayName,
            },
          })
          return
        }
      }

      // No 2FA required - redirect normally
      if (email === 'hussein.srour@thakralone.com') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  // Test helper function to send verification email to currently logged in user
  const handleSendTestVerificationEmail = async () => {
    if (!auth.currentUser) {
      alert('Please sign in first to test verification emails')
      return
    }

    setSendingTestEmail(true)
    setTestEmailSent(false)

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login?verified=true',
        handleCodeInApp: false,
      }
      await sendEmailVerification(auth.currentUser, actionCodeSettings)
      setTestEmailSent(true)
      logger.log('📧 Test verification email sent to:', auth.currentUser.email)

      setTimeout(() => {
        setTestEmailSent(false)
      }, 5000)
    } catch (error: any) {
      logger.error('Failed to send test email:', error)
      alert('Failed to send test email: ' + error.message)
    } finally {
      setSendingTestEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg"
          >
            <LogIn className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">MWCI Tracker</h1>
          <p className="text-slate-600">Project Management Dashboard</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h2>

          {verificationSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Email Verified Successfully!</p>
                {auth.currentUser ? (
                  <div className="text-sm text-green-600 mt-1">
                    <p>Account: <span className="font-medium">{auth.currentUser.email}</span></p>
                    <p className="mt-1">✨ Redirecting you to your dashboard...</p>
                  </div>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    You can now sign in with your account.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="you@thakralone.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-sky-600 hover:text-sky-700 font-semibold transition"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Test Helper - Only show if user is logged in */}
          {auth.currentUser && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">
                🧪 Test Helper (logged in as: {auth.currentUser.email})
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendTestVerificationEmail}
                disabled={sendingTestEmail}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendingTestEmail ? 'Sending...' : 'Send Test Verification Email'}
              </motion.button>
              {testEmailSent && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-600 text-center mt-2"
                >
                  ✅ Test email sent! Check your inbox and click the verification link.
                </motion.p>
              )}
              <p className="text-xs text-slate-400 text-center mt-2">
                This will send a verification email with the auto-redirect configured.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
