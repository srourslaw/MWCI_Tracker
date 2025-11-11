import { useState, useEffect } from 'react'
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
import { taskService } from '../services/taskService'
import { Task } from '../types/task'

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
        console.error('Error loading all tasks:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const statsDisplay = [
    { label: 'Team Members', value: stats.teamMembers.toString(), icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Tasks', value: stats.totalTasks.toString(), icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Completion Rate', value: stats.completionRate, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

  // Recent activities from all tasks
  const recentActivities = allTasks.slice(0, 5).map(task => ({
    user: task.userEmail.split('@')[0],
    action: task.status === 'completed' ? 'completed task' : task.status === 'in-progress' ? 'is working on' : 'created task',
    task: task.title,
    time: new Date(task.updatedAt).toLocaleString(),
  }))

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
          {statsDisplay.map((stat, index) => (
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

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-purple-200 mt-4">Loading team data...</p>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{member.email.split('@')[0]}</h4>
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
                <p className="text-purple-200">No team members yet</p>
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
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-purple-200 mt-4">Loading activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-purple-200">No recent activities</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
