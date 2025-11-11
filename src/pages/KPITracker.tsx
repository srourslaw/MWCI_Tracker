import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  User,
  BarChart2,
  Plus,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
} from 'lucide-react'
import { kpiService } from '../services/kpiService'
import { KPI, KPIInput } from '../types/kpi'
import { getTeamMemberName } from '../data/teamMembers'
import KPIModal from '../components/KPIModal'
import { importInitialKPIs } from '../utils/importKPIs'

export default function KPITracker() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [kpis, setKPIs] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null)
  const [importing, setImporting] = useState(false)

  const isAdmin = user?.email === 'hussein.srour@thakralone.com'

  useEffect(() => {
    const unsubscribe = kpiService.subscribeToKPIs(
      (updatedKPIs) => {
        setKPIs(updatedKPIs)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading KPIs:', error)
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

  const handleCreateKPI = async (kpiInput: KPIInput) => {
    if (!user) return
    await kpiService.createKPI(user.uid, kpiInput)
  }

  const handleUpdateKPI = async (kpiInput: KPIInput) => {
    if (!selectedKPI) return
    await kpiService.updateKPI(selectedKPI.id, kpiInput)
  }

  const handleDeleteKPI = async (kpiId: string) => {
    if (confirm('Are you sure you want to delete this KPI?')) {
      await kpiService.deleteKPI(kpiId)
    }
  }

  const openCreateModal = () => {
    setSelectedKPI(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEditModal = (kpi: KPI) => {
    setSelectedKPI(kpi)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleImportKPIs = async () => {
    if (!user) return

    if (!confirm('This will import initial KPI data. Continue?')) {
      return
    }

    setImporting(true)
    try {
      const result = await importInitialKPIs(user.uid)
      alert(`Import complete!\n\nSuccessful: ${result.success}\nFailed: ${result.failed}`)
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Check console for details.')
    } finally {
      setImporting(false)
    }
  }

  const categories: string[] = [
    'All',
    'Consumptions',
    'Consumptions, Reversals, Revisions',
    'Reversals',
    'Revisions',
    'Installations',
    'Other',
  ]

  const statuses = ['All', 'Not Started', 'In Progress', 'Completed', 'Onhold']

  const filteredKPIs = kpis.filter((kpi) => {
    const matchesSearch =
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kpi.owner && kpi.owner.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = filterCategory === 'All' || kpi.category === filterCategory
    const matchesStatus = filterStatus === 'All' || kpi.devStatus === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Passed':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
      case 'Ready for SIT':
        return 'bg-blue-100 text-blue-700'
      case 'Not Started':
      case 'Pending':
        return 'bg-slate-100 text-slate-600'
      case 'Failed':
        return 'bg-red-100 text-red-700'
      case 'Onhold':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 25) return 'bg-amber-500'
    return 'bg-slate-300'
  }

  // Calculate overall progress
  const avgDevProgress = kpis.length > 0
    ? Math.round(kpis.reduce((sum, kpi) => sum + kpi.devCompletion, 0) / kpis.length)
    : 0

  const avgSitProgress = kpis.length > 0
    ? Math.round(kpis.reduce((sum, kpi) => sum + kpi.sitCompletion, 0) / kpis.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">KPI Tracker</h1>
                <p className="text-sm text-slate-600">ECC BI Report Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-lg">
                <User className="w-5 h-5 text-sky-600" />
                <span className="text-slate-700 text-sm">{user?.email && getTeamMemberName(user.email)}</span>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Total KPIs</p>
            <p className="text-3xl font-bold text-slate-800">{kpis.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">DEV Progress</p>
            <p className="text-3xl font-bold text-slate-800">{avgDevProgress}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">SIT Progress</p>
            <p className="text-3xl font-bold text-slate-800">{avgSitProgress}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-slate-800">
              {kpis.filter(k => k.devStatus === 'Completed').length}
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-2xl p-6 mb-6"
        >
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KPIs..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dev Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImportKPIs}
                    disabled={importing}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {importing ? 'Importing...' : 'Import Data'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreateModal}
                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add KPI
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-morphism rounded-2xl p-6"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading KPIs...</p>
            </div>
          ) : filteredKPIs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Category</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">KPI Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Owner</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-700">DEV</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-700">SIT</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-700">UAT</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-700">PROD</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Remarks</th>
                    {isAdmin && <th className="text-center p-3 text-sm font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredKPIs.map((kpi, index) => (
                    <motion.tr
                      key={kpi.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-sky-50/50 transition"
                    >
                      <td className="p-3">
                        <span className="text-xs font-medium text-sky-600">{kpi.category}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{kpi.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          <span className={`px-2 py-0.5 rounded ${getStatusColor(kpi.signoffStatus)}`}>
                            {kpi.signoffStatus}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{kpi.owner || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(kpi.devStatus)}`}>
                            {kpi.devStatus}
                          </span>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getProgressColor(kpi.devCompletion)}`}
                              style={{ width: `${kpi.devCompletion}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{kpi.devCompletion}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(kpi.sitStatus)}`}>
                            {kpi.sitStatus}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{kpi.sitCompletion}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(kpi.uatStatus)}`}>
                            {kpi.uatStatus}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{kpi.uatCompletion}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(kpi.prodStatus)}`}>
                            {kpi.prodStatus}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{kpi.prodCompletion}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-slate-600 max-w-xs truncate">
                        {kpi.remarks || '-'}
                      </td>
                      {isAdmin && (
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(kpi)}
                              className="p-1.5 hover:bg-sky-50 text-sky-600 rounded transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKPI(kpi.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No KPIs found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* KPI Modal */}
      <KPIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateKPI : handleUpdateKPI}
        kpi={selectedKPI}
        mode={modalMode}
      />
    </div>
  )
}
