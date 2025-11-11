import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
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
  Calendar
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@thakralone.com', tasks: 12, completed: 8 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@thakralone.com', tasks: 15, completed: 10 },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@thakralone.com', tasks: 10, completed: 7 },
  ])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const stats = [
    { label: 'Team Members', value: '12', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Projects', value: '5', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Tasks', value: '156', icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-morphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-purple-200">Full System Overview</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-lg">
                <Shield className="w-5 h-5 text-orange-300" />
                <span className="text-white text-sm font-semibold">Administrator</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-lg">
                <User className="w-5 h-5 text-purple-300" />
                <span className="text-white text-sm">{user?.email}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
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
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, Administrator!
          </h2>
          <p className="text-purple-200">Complete overview of all projects and team activities.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-purple-200 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
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
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Team Members</h3>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{member.name}</h4>
                      <p className="text-purple-200 text-sm">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{member.completed}/{member.tasks}</p>
                      <p className="text-purple-200 text-sm">Tasks</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(member.completed / member.tasks) * 100}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
            </div>

            <div className="space-y-4">
              {[
                { user: 'John Doe', action: 'completed task', task: 'API Integration', time: '2 hours ago' },
                { user: 'Jane Smith', action: 'started task', task: 'UI Design', time: '4 hours ago' },
                { user: 'Mike Johnson', action: 'updated', task: 'Documentation', time: '6 hours ago' },
                { user: 'John Doe', action: 'created task', task: 'Code Review', time: '8 hours ago' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white">
                        <span className="font-semibold">{activity.user}</span>
                        {' '}<span className="text-purple-200">{activity.action}</span>
                      </p>
                      <p className="text-purple-300 text-sm mt-1">{activity.task}</p>
                    </div>
                    <div className="flex items-center gap-2 text-purple-200 text-xs">
                      <Calendar className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
