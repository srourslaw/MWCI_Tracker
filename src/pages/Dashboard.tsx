import { useState, useEffect } from 'react'
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
  Calendar,
  Edit,
  Trash2
} from 'lucide-react'
import { taskService } from '../services/taskService'
import { Task, TaskInput } from '../types/task'
import TaskModal from '../components/TaskModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time tasks
    const unsubscribe = taskService.subscribeToUserTasks(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks)
        setLoading(false)

        // Update stats
        setStats({
          total: updatedTasks.length,
          inProgress: updatedTasks.filter(t => t.status === 'in-progress').length,
          completed: updatedTasks.filter(t => t.status === 'completed').length,
        })
      },
      (error) => {
        console.error('Error loading tasks:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const handleCreateTask = async (taskInput: TaskInput) => {
    if (!user) return
    await taskService.createTask(user.uid, user.email!, taskInput)
  }

  const handleUpdateTask = async (taskInput: TaskInput) => {
    if (!selectedTask) return
    await taskService.updateTask(selectedTask.id, taskInput)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await taskService.deleteTask(taskId)
    }
  }

  const openCreateModal = () => {
    setSelectedTask(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setModalMode('edit')
    setModalOpen(true)
  }

  const statsDisplay = [
    { label: 'Total Tasks', value: stats.total.toString(), icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
    { label: 'In Progress', value: stats.inProgress.toString(), icon: Clock, color: 'from-purple-500 to-pink-500' },
    { label: 'Completed', value: stats.completed.toString(), icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
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
          {statsDisplay.map((stat, index) => (
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
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-purple-200 mt-4">Loading tasks...</p>
            </div>
          ) : (
            <>
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
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{task.title}</h4>
                          {task.description && (
                            <p className="text-purple-200 text-sm mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-purple-300" />
                            <span className="text-purple-200 text-sm">{task.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {task.status}
                        </span>
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 hover:bg-blue-500/20 text-blue-300 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 hover:bg-red-500/20 text-red-300 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-purple-200">No tasks yet. Add your first task to get started!</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateTask : handleUpdateTask}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  )
}
