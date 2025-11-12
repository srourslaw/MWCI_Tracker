import { motion } from 'framer-motion'
import { Clock, Mail, Shield, CheckCircle, AlertCircle, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { UserProfile } from '../types/user'

interface Props {
  userProfile: UserProfile
}

export default function PendingApprovalPage({ userProfile }: Props) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
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
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full font-semibold shadow-lg mb-8">
              <Clock className="w-5 h-5" />
              {statusInfo.action}
            </div>

            {/* Help Text */}
            {!userProfile.emailVerified && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                <p className="text-amber-800 text-sm">
                  <strong>Didn't receive the email?</strong> Check your spam folder or
                  contact support for assistance.
                </p>
              </div>
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
