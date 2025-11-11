import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  User,
  LayoutDashboard,
  CheckSquare,
  Clock,
  TrendingUp,
  Plus,
  Calendar
} from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks] = useState([
    { id: 1, title: 'Review project requirements', status: 'completed', date: '2025-11-10' },
    { id: 2, title: 'Update documentation', status: 'in-progress', date: '2025-11-11' },
    { id: 3, title: 'Team meeting preparation', status: 'pending', date: '2025-11-12' },
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
    { label: 'Total Tasks', value: '24', icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
    { label: 'In Progress', value: '8', icon: Clock, color: 'from-purple-500 to-pink-500' },
    { label: 'Completed', value: '16', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-morphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MWCI Tracker</h1>
                <p className="text-sm text-purple-200">Project Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-purple-200">Here's what's happening with your projects today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Your Tasks</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </motion.button>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <h4 className="text-white font-semibold">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-purple-300" />
                        <span className="text-purple-200 text-sm">{task.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-purple-200">No tasks yet. Add your first task to get started!</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
