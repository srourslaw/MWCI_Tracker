import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  verifyTwoFactorCode,
  getCodeExpiryTime,
  createTwoFactorCode,
  send2FACodeEmail,
} from '../services/twoFactorService'
import { logger } from '../utils/logger'

export default function TwoFactorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, userId, userName } = location.state || {}

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [expirySeconds, setExpirySeconds] = useState(600) // 10 minutes

  // Redirect if no state provided
  useEffect(() => {
    if (!email || !userId) {
      navigate('/login')
    }
  }, [email, userId, navigate])

  // Update expiry countdown
  useEffect(() => {
    if (!userId) return

    const updateExpiry = async () => {
      const remaining = await getCodeExpiryTime(userId)
      if (remaining !== null) {
        setExpirySeconds(remaining)
      }
    }

    updateExpiry()
    const interval = setInterval(updateExpiry, 1000)
    return () => clearInterval(interval)
  }, [userId])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-verify when all 6 digits entered
    if (newCode.every((digit) => digit) && !verifying) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split('')
    while (newCode.length < 6) newCode.push('')

    setCode(newCode)

    if (newCode.every((digit) => digit)) {
      handleVerify(newCode.join(''))
    }
  }

  const handleVerify = async (codeString: string) => {
    setVerifying(true)
    setError('')

    try {
      const isValid = await verifyTwoFactorCode(userId, codeString)

      if (isValid) {
        setSuccess(true)
        logger.log('2FA verification successful')

        // Wait a moment to show success, then redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setError('Invalid or expired code. Please try again.')
        setCode(['', '', '', '', '', ''])
        const firstInput = document.getElementById('code-0')
        firstInput?.focus()
      }
    } catch (error) {
      logger.error('Error verifying 2FA code:', error)
      setError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setError('')

    try {
      const newCode = await createTwoFactorCode(userId, email)
      await send2FACodeEmail(email, newCode, userName || 'User')

      // Reset input
      setCode(['', '', '', '', '', ''])
      const firstInput = document.getElementById('code-0')
      firstInput?.focus()

      logger.log('2FA code resent successfully')
    } catch (error) {
      logger.error('Error resending 2FA code:', error)
      setError('Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleGoBack = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-slate-300">Enter the 6-digit code sent to your email</p>
        </div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-8 shadow-xl"
        >
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold">Verification Successful!</p>
                  <p className="text-green-700 text-sm">Redirecting to dashboard...</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {!success && (
            <>
              {/* Email Display */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Code sent to:</span>
                </div>
                <p className="text-slate-800 font-semibold mt-1">{email}</p>
              </div>

              {/* Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={verifying || success}
                      className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Expiry Timer */}
              {expirySeconds > 0 && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-slate-600">
                    Code expires in{' '}
                    <span
                      className={`font-semibold ${
                        expirySeconds < 60 ? 'text-red-600' : 'text-purple-600'
                      }`}
                    >
                      {formatTime(expirySeconds)}
                    </span>
                  </p>
                </div>
              )}

              {/* Resend Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendCode}
                disabled={resending || verifying}
                className="w-full mb-4 py-3 px-4 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </motion.button>

              {/* Back to Login */}
              <button
                onClick={handleGoBack}
                disabled={verifying}
                className="w-full py-3 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Didn't receive the code?</strong>
              <br />
              Check your spam folder or click "Resend Code" above.
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
      `}</style>
    </div>
  )
}
