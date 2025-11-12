import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  User,
  Shield,
  Users,
  CheckSquare,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  BarChart2,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Send,
  FileText
} from 'lucide-react'
import { taskService } from '../services/taskService'
import { Task } from '../types/task'
import { getTeamMemberName, TEAM_MEMBERS } from '../data/teamMembers'
import TeamDirectory from '../components/TeamDirectory'
import ColumnPermissionsManager from '../components/ColumnPermissionsManager'
import UserApprovalDashboard from '../components/UserApprovalDashboard'
import { subscribeToAllUsers } from '../services/userService'
import { UserProfile } from '../types/user'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { logger } from '../utils/logger'

interface TeamMember {
  email: string
  tasks: number
  completed: number
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    teamMembers: 0,
    activeProjects: 0,
    totalTasks: 0,
    completionRate: '0%',
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)

  useEffect(() => {
    // Subscribe to all tasks
    const unsubscribe = taskService.subscribeToAllTasks(
      (tasks) => {
        setAllTasks(tasks)
        setLoading(false)

        // Calculate stats
        const uniqueUsers = new Set(tasks.map(t => t.userEmail))
        const completed = tasks.filter(t => t.status === 'completed').length
        const completionRate = tasks.length > 0
          ? `${Math.round((completed / tasks.length) * 100)}%`
          : '0%'

        setStats({
          teamMembers: uniqueUsers.size,
          activeProjects: Math.ceil(uniqueUsers.size / 2),
          totalTasks: tasks.length,
          completionRate,
        })

        // Calculate team member stats
        const memberStats = new Map<string, { tasks: number; completed: number }>()
        tasks.forEach(task => {
          const current = memberStats.get(task.userEmail) || { tasks: 0, completed: 0 }
          memberStats.set(task.userEmail, {
            tasks: current.tasks + 1,
            completed: current.completed + (task.status === 'completed' ? 1 : 0),
          })
        })

        const members: TeamMember[] = Array.from(memberStats.entries()).map(([email, data]) => ({
          email,
          tasks: data.tasks,
          completed: data.completed,
        }))

        setTeamMembers(members)
      },
      (error) => {
        logger.error('Error loading all tasks:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Subscribe to all registered users in real-time
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(
      (users) => {
        setAllUsers(users)
        setLoadingUsers(false)
      },
      (error) => {
        logger.error('Error loading users:', error)
        setLoadingUsers(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      logger.error('Failed to log out:', error)
    }
  }

  // Test helper function to send verification email to currently logged in user
  const handleSendTestVerificationEmail = async () => {
    if (!auth.currentUser) {
      alert('No user logged in')
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

  const statsDisplay = [
    { label: 'Team Members', value: TEAM_MEMBERS.length.toString(), icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: stats.teamMembers.toString(), icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Tasks', value: stats.totalTasks.toString(), icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Completion Rate', value: stats.completionRate, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

  // Recent activities from all tasks
  const recentActivities = allTasks.slice(0, 5).map(task => ({
    user: getTeamMemberName(task.userEmail),
    action: task.status === 'completed' ? 'completed task' : task.status === 'in-progress' ? 'is working on' : 'created task',
    task: task.title,
    time: new Date(task.updatedAt).toLocaleString(),
  }))

  // Helper functions for user status display
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle
      case 'pending':
        return Clock
      case 'rejected':
        return XCircle
      default:
        return User
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getDomainColor = (domain: string) => {
    if (domain === 'thakralone.com') return 'from-purple-500 to-pink-500'
    if (domain === 'manilawater.com') return 'from-blue-500 to-cyan-500'
    return 'from-slate-500 to-slate-600'
  }

  const getDomainBadgeColor = (domain: string) => {
    if (domain === 'thakralone.com') return 'bg-purple-100 text-purple-700'
    if (domain === 'manilawater.com') return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Full System Overview</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/kpi-tracker"
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition font-medium text-sm"
              >
                <BarChart2 className="w-4 h-4" />
                KPI Tracker
              </Link>
              <Link
                to="/deliverables-tracker"
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition font-medium text-sm"
              >
                <FileText className="w-4 h-4" />
                Deliverables
              </Link>
              <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="text-slate-700 text-sm font-semibold">Administrator</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-lg">
                <User className="w-5 h-5 text-sky-600" />
                <span className="text-slate-700 text-sm">{user?.email}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome, Administrator!
          </h2>
          <p className="text-slate-600">Complete overview of all projects and team activities.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-sky-600" />
              <h3 className="text-2xl font-bold text-slate-800">Team Members</h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading team data...</p>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-slate-800 font-semibold">{getTeamMemberName(member.email)}</h4>
                        <p className="text-slate-600 text-sm">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 font-semibold">{member.completed}/{member.tasks}</p>
                        <p className="text-slate-600 text-sm">Tasks</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No team members yet</p>
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-sky-600" />
              <h3 className="text-2xl font-bold text-slate-800">Recent Activity</h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-800">
                        <span className="font-semibold">{activity.user}</span>
                        {' '}<span className="text-slate-600">{activity.action}</span>
                      </p>
                      <p className="text-sky-600 text-sm mt-1">{activity.task}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No recent activities</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* User Approvals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <UserApprovalDashboard adminEmail={user?.email || ''} />
        </motion.div>

        {/* Registered Users Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-8 glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">Registered Users</h2>
              <p className="text-sm text-slate-600">
                All users who have registered on the platform
              </p>
            </div>
            {!loadingUsers && (
              <div className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full font-semibold text-sm">
                {allUsers.length} total
              </div>
            )}
          </div>

          {loadingUsers ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading users...</p>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-800 font-semibold text-lg">No Users Yet</p>
              <p className="text-slate-600 text-sm mt-2">
                Users will appear here once they register
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">User</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Domain</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Email Verified</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Last Login</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((userProfile, index) => {
                    const StatusIcon = getStatusIcon(userProfile.approvalStatus)
                    return (
                      <motion.tr
                        key={userProfile.uid}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        {/* Avatar + Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getDomainColor(
                                userProfile.domain
                              )} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                            >
                              {userProfile.displayName
                                ? userProfile.displayName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                : userProfile.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-slate-800 font-semibold">
                                {userProfile.displayName || 'New User'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-xs">{userProfile.email}</span>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 ${getDomainBadgeColor(
                              userProfile.domain
                            )} text-xs font-semibold rounded`}
                          >
                            @{userProfile.domain}
                          </span>
                        </td>

                        {/* Approval Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${getStatusColor(
                              userProfile.approvalStatus
                            )} text-xs font-semibold rounded`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {userProfile.approvalStatus.charAt(0).toUpperCase() +
                              userProfile.approvalStatus.slice(1)}
                          </span>
                        </td>

                        {/* Email Verified */}
                        <td className="py-4 px-4">
                          {userProfile.emailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-4">
                          <span className="text-slate-600 text-sm">
                            {formatLastLogin(userProfile.lastLoginAt)}
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-4">
                          <div className="text-slate-600 text-sm">
                            {userProfile.createdAt.toLocaleDateString()}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Team Directory Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <TeamDirectory />
        </motion.div>

        {/* Column Permissions Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 glass-morphism rounded-2xl p-6"
        >
          <ColumnPermissionsManager userId={user?.uid || ''} />
        </motion.div>

        {/* Test Helper Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">Email Verification Test Helper</h2>
              <p className="text-sm text-slate-600">
                Test the automatic email verification redirect
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-blue-900 text-sm mb-2">
              <strong>How to test:</strong>
            </p>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>Click "Send Test Verification Email" below</li>
              <li>Check your inbox for the verification email</li>
              <li>Click the verification link in the email</li>
              <li>You should automatically return to the login page</li>
              <li>The page will show a green success banner</li>
              <li>After 2 seconds, you'll be auto-redirected back here</li>
              <li><strong>No manual refresh needed!</strong></li>
            </ol>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendTestVerificationEmail}
            disabled={sendingTestEmail}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sendingTestEmail ? 'Sending Email...' : 'Send Test Verification Email'}
          </motion.button>

          {testEmailSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              <p className="font-semibold">✅ Test email sent successfully!</p>
              <p className="text-sm mt-1">Check your inbox at: <strong>{user?.email}</strong></p>
              <p className="text-sm mt-1">Click the verification link to test the auto-redirect.</p>
            </motion.div>
          )}

          <p className="text-xs text-slate-400 text-center mt-4">
            🧪 This sends a verification email with the automatic redirect configured. The redirect should work without any manual refresh!
          </p>
        </motion.div>
      </main>
    </div>
  )
}
