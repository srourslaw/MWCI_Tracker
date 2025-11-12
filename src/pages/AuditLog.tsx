import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  User,
  FileText,
  Download,
  Search,
  Filter,
  X,
  ChevronLeft,
} from 'lucide-react'
import { auditService } from '../services/auditService'
import { AuditLog as AuditLogType, AuditFilters } from '../types/audit'
import { getTeamMemberName } from '../data/teamMembers'
import { logger } from '../utils/logger'

export default function AuditLog() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AuditFilters>({})
  const [stats, setStats] = useState<any>(null)

  const isAdmin = user?.email === 'hussein.srour@thakralone.com'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }

    const unsubscribe = auditService.subscribeToAuditLogs(
      filters,
      (updatedLogs) => {
        setLogs(updatedLogs)
        setLoading(false)
      },
      (error) => {
        logger.error('Error loading audit logs:', error)
        setLoading(false)
      },
      500 // Load last 500 changes
    )

    // Load stats
    auditService.getAuditStats().then(setStats)

    return unsubscribe
  }, [filters, isAdmin, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.kpiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.field.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'User', 'KPI', 'Category', 'Field', 'Old Value', 'New Value', 'Action']
    const rows = filteredLogs.map(log => [
      log.changedAt.toLocaleDateString(),
      log.changedAt.toLocaleTimeString(),
      log.changedByName,
      log.kpiName,
      log.kpiCategory,
      log.field,
      log.oldValue,
      log.newValue,
      log.changeType,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const activeFiltersCount = Object.values(filters).filter(v => v).length + (searchQuery ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
                <p className="text-sm text-slate-600">
                  Complete change history and traceability
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/kpi-tracker"
                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to KPI Tracker
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

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <FileText className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-slate-600 text-sm">Total Changes</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalChanges}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-morphism rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-slate-600 text-sm">Active Users</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.uniqueUsers}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-slate-600 text-sm">Updates</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.updates}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-morphism rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-slate-600 text-sm">Creates</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.creates}</p>
            </motion.div>
          </div>
        )}

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by KPI, user, or field..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-2 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600">
            Showing <span className="font-bold text-sky-600">{filteredLogs.length}</span> of <span className="font-bold">{logs.length}</span> changes
          </div>
        </motion.div>

        {/* Audit Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-morphism rounded-2xl p-6 overflow-x-auto"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading audit logs...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-700">Date & Time</th>
                  <th className="text-left p-3 font-semibold text-slate-700">User</th>
                  <th className="text-left p-3 font-semibold text-slate-700">KPI Name</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Field</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Old Value</th>
                  <th className="text-left p-3 font-semibold text-slate-700">New Value</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-sky-50/50 transition"
                  >
                    <td className="p-3 text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.changedAt.toLocaleDateString()}</span>
                        <span className="text-xs text-slate-500">{log.changedAt.toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{log.changedByName}</span>
                        <span className="text-xs text-slate-500">{log.changedByEmail}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-800 font-medium max-w-[200px] truncate">
                      {log.kpiName}
                    </td>
                    <td className="p-3 text-slate-600">{log.kpiCategory}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {log.field}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-[150px] truncate">{log.oldValue || '-'}</td>
                    <td className="p-3 text-slate-800 font-medium max-w-[150px] truncate">{log.newValue || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.changeType === 'create'
                            ? 'bg-green-100 text-green-700'
                            : log.changeType === 'update'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.changeType.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No audit logs found</p>
              <p className="text-sm text-slate-500 mt-2">Start making changes to see the audit trail here</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
