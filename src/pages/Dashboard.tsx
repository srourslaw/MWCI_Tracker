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
import { getTeamMemberName } from '../data/teamMembers'

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">MWCI Tracker</h1>
                <p className="text-sm text-slate-600">Project Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
            Welcome back, {user?.email ? getTeamMemberName(user.email) : 'User'}!
          </h2>
          <p className="text-slate-600">Here's what's happening with your projects today.</p>
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
                  <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl shadow-md`}>
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
            <h3 className="text-2xl font-bold text-slate-800">Your Tasks</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading tasks...</p>
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
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-slate-800 font-semibold">{task.title}</h4>
                          {task.description && (
                            <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-sky-500" />
                            <span className="text-slate-500 text-sm">{task.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status}
                        </span>
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
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
                  <p className="text-slate-600">No tasks yet. Add your first task to get started!</p>
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
