import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  UserX,
  Mail,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { subscribeToPendingApprovals, approveUser, rejectUser } from '../services/userService'
import { UserProfile } from '../types/user'
import { logger } from '../utils/logger'

interface Props {
  adminEmail: string
}

export default function UserApprovalDashboard({ adminEmail }: Props) {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [processingUid, setProcessingUid] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToPendingApprovals(
      (users) => {
        setPendingUsers(users)
        setLoading(false)
      },
      (error) => {
        logger.error('Error loading pending approvals:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const handleApprove = async (uid: string, email: string) => {
    setProcessingUid(uid)
    try {
      await approveUser(uid, adminEmail)
      logger.log('User approved successfully:', email)
    } catch (error) {
      logger.error('Failed to approve user:', error)
      alert('Failed to approve user. Please try again.')
    } finally {
      setProcessingUid(null)
    }
  }

  const handleReject = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to reject access for ${email}?`)) {
      return
    }

    setProcessingUid(uid)
    try {
      await rejectUser(uid, adminEmail)
      logger.log('User rejected successfully:', email)
    } catch (error) {
      logger.error('Failed to reject user:', error)
      alert('Failed to reject user. Please try again.')
    } finally {
      setProcessingUid(null)
    }
  }

  const getDomainColor = (domain: string) => {
    if (domain === 'manilawater.com') return 'from-blue-500 to-cyan-500'
    return 'from-purple-500 to-pink-500'
  }

  const getDomainBadgeColor = (domain: string) => {
    if (domain === 'manilawater.com') return 'bg-blue-100 text-blue-700'
    return 'bg-purple-100 text-purple-700'
  }

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">User Approvals</h2>
          <p className="text-sm text-slate-600">
            Manage access requests from @manilawater.com users
          </p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-semibold text-sm">
            {pendingUsers.length} pending
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading pending approvals...</p>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-slate-800 font-semibold text-lg">All Clear!</p>
          <p className="text-slate-600 text-sm mt-2">
            No pending approval requests at the moment
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pendingUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${getDomainColor(
                      user.domain
                    )} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                  >
                    {user.displayName
                      ? user.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : user.email[0].toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-800 font-bold text-lg truncate">
                        {user.displayName || 'New User'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 ${getDomainBadgeColor(
                          user.domain
                        )} text-xs font-semibold rounded`}
                      >
                        @{user.domain}
                      </span>
                      {user.emailVerified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Requested on {user.createdAt.toLocaleDateString()} at{' '}
                          {user.createdAt.toLocaleTimeString()}
                        </span>
                      </div>

                      {!user.emailVerified && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Email not verified yet</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(user.uid, user.email)}
                        disabled={processingUid === user.uid || !user.emailVerified}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingUid === user.uid ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Approve Access
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(user.uid, user.email)}
                        disabled={processingUid === user.uid}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingUid === user.uid ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Reject Access
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-blue-900 font-semibold text-sm mb-1">
              Approval Policy
            </h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>@thakralone.com</strong> users are automatically approved after
                  email verification
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>@manilawater.com</strong> users require your manual approval
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Other email domains are automatically rejected for security
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
