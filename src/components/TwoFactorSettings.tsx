import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Check, X, AlertCircle } from 'lucide-react'
import { enableTwoFactor, disableTwoFactor } from '../services/userService'
import { useAuth } from '../hooks/useAuth'
import { logger } from '../utils/logger'

export default function TwoFactorSettings() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isEnabled = userProfile?.twoFactorEnabled || false

  const handleToggle2FA = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isEnabled) {
        await disableTwoFactor(user.uid)
        setSuccess('Two-Factor Authentication disabled successfully')
        logger.log('2FA disabled by user')
      } else {
        await enableTwoFactor(user.uid)
        setSuccess('Two-Factor Authentication enabled successfully! You will need to enter a code sent to your email on your next login.')
        logger.log('2FA enabled by user')
      }

      // Refresh user profile to get updated 2FA status
      await refreshUserProfile()

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
      }, 5000)
    } catch (error) {
      logger.error('Error toggling 2FA:', error)
      setError('Failed to update 2FA settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">Two-Factor Authentication</h2>
          <p className="text-sm text-slate-600">
            Add an extra layer of security to your account
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full font-semibold text-sm ${
            isEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
        >
          <Check className="w-5 h-5" />
          <span className="text-sm">{success}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
        >
          <X className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-blue-900 font-semibold text-sm mb-1">
              How 2FA Works
            </h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>When you login, a 6-digit code will be sent to your email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Enter the code to complete login - adds extra security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Code expires in 10 minutes for security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>100% FREE - no SMS fees, uses email codes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle2FA}
        disabled={loading}
        className={`w-full py-3 px-4 font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isEnabled
            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            <span>Updating...</span>
          </>
        ) : isEnabled ? (
          <>
            <X className="w-5 h-5" />
            <span>Disable Two-Factor Authentication</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Enable Two-Factor Authentication</span>
          </>
        )}
      </motion.button>

      {/* Security Note */}
      {!isEnabled && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-xs">
            <strong>Recommended for admins:</strong> Enable 2FA to protect your account
            from unauthorized access, even if your password is compromised.
          </p>
        </div>
      )}
    </div>
  )
}
