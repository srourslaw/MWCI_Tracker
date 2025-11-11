import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.endsWith('@thakralone.com')) {
      setError('Please use your company email (@thakralone.com)')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await signup(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: '', color: '' }
    if (pass.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (pass.length < 10) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden py-12">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4"
          >
            <UserPlus className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-purple-200">Join the MWCI Tracker team</p>
        </div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-8 shadow-2xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Company Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="you@thakralone.com"
                  required
                />
              </div>
              {email && !email.endsWith('@thakralone.com') && (
                <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Must use @thakralone.com email
                </p>
              )}
              {email && email.endsWith('@thakralone.com') && (
                <p className="mt-2 text-sm text-green-300 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid company email
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-purple-200">Password strength:</span>
                    <span className={`font-semibold ${strength.strength === 1 ? 'text-red-400' : strength.strength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.strength / 3) * 100}%` }}
                      className={`h-full ${strength.color} transition-all duration-300`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-sm text-green-300 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition"
              >
                Sign in here
              </Link>
            </p>
          </div>
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
