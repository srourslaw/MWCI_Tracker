import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, Shield, CheckCircle, AlertCircle, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { UserProfile } from '../types/user'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { logger } from '../utils/logger'

interface Props {
  userProfile: UserProfile
}

export default function PendingApprovalPage({ userProfile }: Props) {
  const { logout, refreshUserProfile } = useAuth()
  const navigate = useNavigate()
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const [checkingVerification, setCheckingVerification] = useState(false)

  // Auto-check for email verification every 3 seconds
  useEffect(() => {
    if (userProfile.emailVerified) return // Already verified

    const interval = setInterval(async () => {
      try {
        setCheckingVerification(true)
        // Reload Firebase auth state to get latest emailVerified status
        await auth.currentUser?.reload()

        // Check if email is now verified
        if (auth.currentUser?.emailVerified) {
          logger.log('Email verified! Refreshing user profile...')
          // Refresh user profile to update approval status
          await refreshUserProfile()
          // The user will be automatically redirected by the auth system
        }
      } catch (error) {
        logger.error('Error checking verification status:', error)
      } finally {
        setCheckingVerification(false)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [userProfile.emailVerified, refreshUserProfile])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setResendError('No user logged in')
      return
    }

    setResendingEmail(true)
    setResendError('')
    setResendSuccess(false)

    try {
      await sendEmailVerification(auth.currentUser)
      setResendSuccess(true)
      logger.log('Verification email resent to:', auth.currentUser.email)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (error: any) {
      logger.error('Failed to resend verification email:', error)
      setResendError(error.message || 'Failed to resend email. Please try again later.')
    } finally {
      setResendingEmail(false)
    }
  }

  const getStatusInfo = () => {
    if (!userProfile.emailVerified) {
      return {
        icon: Mail,
        iconColor: 'from-amber-500 to-orange-500',
        title: 'Email Verification Required',
        message: 'Please verify your email address to continue',
        description:
          'We sent a verification link to your email. Click the link to verify your account.',
        action: 'Check your inbox',
      }
    }

    if (userProfile.approvalStatus === 'pending') {
      return {
        icon: Clock,
        iconColor: 'from-blue-500 to-cyan-500',
        title: 'Approval Pending',
        message: 'Your account is awaiting administrator approval',
        description:
          'Since you registered with an @manilawater.com email, an administrator needs to approve your access. You will receive an email notification once your account is approved.',
        action: 'Please wait for approval',
      }
    }

    if (userProfile.approvalStatus === 'rejected') {
      return {
        icon: AlertCircle,
        iconColor: 'from-red-500 to-rose-500',
        title: 'Access Denied',
        message: 'Your account access has been denied',
        description:
          'If you believe this is an error, please contact the administrator for assistance.',
        action: 'Contact administrator',
      }
    }

    return {
      icon: CheckCircle,
      iconColor: 'from-green-500 to-emerald-500',
      title: 'Processing...',
      message: 'Setting up your account',
      description: 'Please wait while we finalize your account setup.',
      action: 'Almost there',
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div
              className={`p-6 bg-gradient-to-br ${statusInfo.iconColor} rounded-2xl shadow-xl`}
            >
              <StatusIcon className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              {statusInfo.title}
            </h1>
            <p className="text-xl text-slate-600 mb-6">{statusInfo.message}</p>
            <p className="text-slate-500 leading-relaxed mb-8">
              {statusInfo.description}
            </p>

            {/* User Info Card */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {userProfile.displayName
                    ? userProfile.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : userProfile.email[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-slate-800 font-semibold">
                    {userProfile.displayName || 'User'}
                  </p>
                  <p className="text-slate-600 text-sm">{userProfile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email Status</span>
                  </div>
                  <p
                    className={`font-semibold ${
                      userProfile.emailVerified ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {userProfile.emailVerified ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Approval Status</span>
                  </div>
                  <p className="font-semibold text-blue-600 capitalize">
                    {userProfile.approvalStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full font-semibold shadow-lg mb-4">
              <Clock className="w-5 h-5" />
              {statusInfo.action}
            </div>

            {/* Auto-checking indicator */}
            {!userProfile.emailVerified && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-8"
              >
                <RefreshCw className={`w-4 h-4 ${checkingVerification ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
                <span>Auto-checking verification status...</span>
              </motion.div>
            )}

            {/* Help Text & Resend Button */}
            {!userProfile.emailVerified && (
              <>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Didn't receive the email?</strong> Check your spam folder or try
                    resending the verification email.
                  </p>
                </div>

                {/* Resend Email Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition font-medium mx-auto mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${resendingEmail ? 'animate-spin' : ''}`} />
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </motion.button>

                {/* Success Message */}
                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4"
                  >
                    <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <strong>Email sent!</strong> Check your inbox (and spam folder).
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                {resendError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
                  >
                    <p className="text-red-700 text-sm flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {resendError}
                    </p>
                  </motion.div>
                )}

                {/* Troubleshooting Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-blue-800 text-sm font-semibold mb-2">
                    📧 Email Not Arriving? Try This:
                  </p>
                  <ul className="text-blue-700 text-xs space-y-1 text-left list-disc list-inside">
                    <li>Check your <strong>spam/junk</strong> folder</li>
                    <li>Wait a few minutes - it can take up to 5 minutes</li>
                    <li>Make sure <strong>{userProfile.email}</strong> is correct</li>
                    <li>Add <strong>noreply@mwci-tracker.firebaseapp.com</strong> to your contacts</li>
                    <li>Contact: hussein.srour@thakralone.com for help</li>
                  </ul>
                </div>
              </>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-slate-300 text-sm">
            MWCI Tracker © {new Date().getFullYear()} - Secure Access Control
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
