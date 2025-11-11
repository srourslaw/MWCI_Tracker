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
  Upload,
  LineChart,
  Table,
} from 'lucide-react'
import { kpiService } from '../services/kpiService'
import { KPI, KPIInput } from '../types/kpi'
import { getTeamMemberName } from '../data/teamMembers'
import KPIModal from '../components/KPIModal'
import EditableCell from '../components/EditableCell'
import { importInitialKPIs } from '../utils/importKPIs'
import { initialKPIs } from '../data/initialKPIs'
import KPIAnalytics from '../components/KPIAnalytics'

export default function KPITracker() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [kpis, setKPIs] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table')

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

  // Auto-import initial data on first load
  useEffect(() => {
    const autoImport = async () => {
      if (kpis.length === 0 && !loading && user && !importing) {
        const hasImported = localStorage.getItem('kpisImported')
        if (!hasImported) {
          console.log('Auto-importing initial KPI data...')
          setImporting(true)
          try {
            const result = await importInitialKPIs(user.uid)
            console.log(`Auto-import complete: ${result.success} successful, ${result.failed} failed`)
            localStorage.setItem('kpisImported', 'true')
          } catch (error) {
            console.error('Auto-import failed:', error)
          } finally {
            setImporting(false)
          }
        }
      }
    }

    autoImport()
  }, [kpis.length, loading, user, importing])

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

  const handleUpdateField = async (kpiId: string, field: string, value: any) => {
    if (!user) return

    // Check if this is a temporary ID (from initial data)
    if (kpiId.startsWith('initial-')) {
      // Find the initial KPI data
      const index = parseInt(kpiId.replace('initial-', ''))
      const initialKPI = initialKPIs[index]

      if (initialKPI) {
        // Create a new KPI in Firestore with the updated field
        const newKPI: KPIInput = {
          ...initialKPI,
          [field]: value,
        }
        await kpiService.createKPI(user.uid, newKPI)
      }
    } else {
      // Update existing KPI in Firestore
      await kpiService.updateKPI(kpiId, { [field]: value } as Partial<KPIInput>)
    }
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

  // Merge initial KPIs with Firestore data
  // Always show initial KPIs, but use Firestore data if it exists for that KPI
  const mergedKPIs: KPI[] = initialKPIs.map((initialKPI, index) => {
    // Try to find matching KPI in Firestore by name and category
    const firestoreKPI = kpis.find(
      (k) => k.name === initialKPI.name && k.category === initialKPI.category
    )

    // If found in Firestore, use that data; otherwise use initial data with temp ID
    if (firestoreKPI) {
      return firestoreKPI
    } else {
      // Return initial KPI with temporary ID for display only
      return {
        ...initialKPI,
        id: `initial-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      } as KPI
    }
  })

  const filteredKPIs = mergedKPIs.filter((kpi) => {
    const matchesSearch =
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kpi.owner && kpi.owner.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  // Group KPIs by category
  const groupedKPIs = filteredKPIs.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = []
    }
    acc[kpi.category].push(kpi)
    return acc
  }, {} as Record<string, KPI[]>)

  // Calculate dynamic percentages from actual data
  const calculateCompletionPercentage = (field: 'devStatus' | 'sitStatus' | 'uatStatus' | 'prodStatus') => {
    if (mergedKPIs.length === 0) return 0

    const completedStatuses = ['Completed', 'Passed']
    const completed = mergedKPIs.filter(kpi => completedStatuses.includes(kpi[field])).length
    return Math.round((completed / mergedKPIs.length) * 100)
  }

  const devCompletionPercent = calculateCompletionPercentage('devStatus')
  const sitCompletionPercent = calculateCompletionPercentage('sitStatus')
  const uatCompletionPercent = calculateCompletionPercentage('uatStatus')
  const prodCompletionPercent = calculateCompletionPercentage('prodStatus')

  // Calculate overall progress for stats cards
  const avgDevProgress = mergedKPIs.length > 0
    ? Math.round(mergedKPIs.reduce((sum, kpi) => sum + kpi.devCompletion, 0) / mergedKPIs.length)
    : 0

  const avgSitProgress = mergedKPIs.length > 0
    ? Math.round(mergedKPIs.reduce((sum, kpi) => sum + kpi.sitCompletion, 0) / mergedKPIs.length)
    : 0

  const getCellBgColor = (status: string | undefined, field: string) => {
    if (!status) return 'bg-white'

    // Customer Dependency colors (orange)
    if (field === 'customerDependency') {
      if (status.includes('PENDING CUSTOMER FOR DATA')) return 'bg-orange-500 text-white'
      if (status === 'Inprogress') return 'bg-orange-300'
      if (status === 'Passed') return 'bg-pink-200'
      if (status === 'Dev Pending - Lawrance') return 'bg-pink-300'
    }

    // Dev Status colors (green/yellow)
    if (field === 'devStatus') {
      if (status === 'Completed') return 'bg-green-500 text-white'
      if (status === 'In Progress') return 'bg-yellow-300'
      if (status.includes('Ready for SIT')) return 'bg-green-200'
    }

    // Revised Dev Status colors
    if (field === 'revisedDevStatus') {
      if (status === 'Passed') return 'bg-pink-200'
      if (status === 'Done') return 'bg-green-300'
      if (status === 'Not Started') return 'bg-red-300'
      if (status === 'Dev Pending - Lawrance') return 'bg-pink-300'
    }

    // Testing status colors
    if (field === 'sitStatus' || field === 'uatStatus' || field === 'prodStatus') {
      if (status === 'Passed') return 'bg-green-200'
      if (status === 'Failed') return 'bg-red-300'
      if (status === 'PENDING CUSTOMER FOR DATA') return 'bg-orange-500 text-white'
      if (status === 'Not Started') return 'bg-gray-200'
      if (status.includes('Can we put')) return 'bg-blue-200'
    }

    return 'bg-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">KPI Tracker - ECC BI Report Monitoring</h1>
                <p className="text-sm text-slate-600">
                  TARGET ECC - 1B | {devCompletionPercent}% DEV Completion | {sitCompletionPercent}% SIT Completion | {uatCompletionPercent}% UAT | {prodCompletionPercent}% PROD
                </p>
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
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-3xl font-bold text-slate-800">{mergedKPIs.length}</p>
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
              {mergedKPIs.filter(k => k.devStatus === 'Completed').length}
            </p>
          </motion.div>
        </div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KPIs..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 flex items-center gap-2 transition ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Table className="w-4 h-4" />
                Table
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 flex items-center gap-2 transition ${
                  viewMode === 'analytics'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LineChart className="w-4 h-4" />
                Analytics
              </motion.button>
            </div>

            {isAdmin && (
              <>
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
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition shadow-md flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add KPI
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Content Area - Table or Analytics */}
        {viewMode === 'analytics' ? (
          <KPIAnalytics kpis={mergedKPIs} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-morphism rounded-2xl p-6 overflow-x-auto"
          >
            {loading || importing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
                <p className="text-slate-600 mt-4">
                  {importing ? 'Importing initial KPI data...' : 'Loading KPIs...'}
                </p>
              </div>
            ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                {/* Row 1: TARGET ECC - 1B */}
                <tr>
                  <th colSpan={11} className="border border-slate-300 p-2 text-center font-bold bg-blue-200">
                    TARGET ECC - 1B
                  </th>
                </tr>

                {/* Row 2: Main Headers with Percentages */}
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border border-slate-300 p-2 text-left font-bold sticky left-0 bg-slate-100 z-10">
                    KPI Relationship
                  </th>
                  <th rowSpan={2} className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    BI Report KPIs<br />(Phase 1c - ECC Sep 30)
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    Customer Signoff on FSD
                  </th>
                  <th rowSpan={2} className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    Owner
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    {devCompletionPercent}%
                  </th>
                  <th rowSpan={2} className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    Remarks 10/11
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#FF8C00', color: 'white' }}>
                    Customer Dependency
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#90EE90' }}>
                    Revised Dev Status
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#32CD32', color: 'white' }}>
                    {sitCompletionPercent}%
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#32CD32', color: 'white' }}>
                    {uatCompletionPercent}%
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-bold" style={{ backgroundColor: '#32CD32', color: 'white' }}>
                    {prodCompletionPercent}%
                  </th>
                </tr>

                {/* Row 3: Sub-Headers */}
                <tr className="bg-slate-50">
                  {/* KPI Relationship - merged with rowspan */}
                  {/* BI Report KPIs - merged with rowspan */}
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#E8F5E9' }}>
                    Status
                  </th>
                  {/* Owner - merged with rowspan */}
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#E8F5E9' }}>
                    DEV - ECC<br />Completion
                  </th>
                  {/* Remarks - merged with rowspan */}
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#FFE0B2' }}>
                    11-Nov
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#E8F5E9' }}>
                    11-Nov
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#C8E6C9' }}>
                    Testing - SIT - ECC<br />Completion
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#C8E6C9' }}>
                    UAT - ECC<br />Completion
                  </th>
                  <th className="border border-slate-300 p-2 text-center font-semibold text-xs" style={{ backgroundColor: '#C8E6C9' }}>
                    PROD - ECC<br />Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
                  <>
                    {/* Category Header */}
                    <tr key={`category-${category}`} className="bg-blue-100">
                      <td colSpan={11} className="border border-slate-300 p-2 font-bold text-left">
                        {category}
                      </td>
                    </tr>
                    {/* KPI Rows */}
                    {categoryKPIs.map((kpi) => (
                      <tr key={kpi.id} className="hover:bg-slate-50 transition">
                        <td className="border border-slate-300 p-1 sticky left-0 bg-white z-10">
                          <div className="text-xs text-slate-600 font-medium px-2 py-1">
                            {category}
                          </div>
                        </td>
                        <td className="border border-slate-300 p-1 bg-white">
                          <EditableCell
                            value={kpi.name}
                            onSave={(v) => handleUpdateField(kpi.id, 'name', v)}
                            editable={isAdmin}
                          />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <EditableCell
                            value={kpi.signoffStatus}
                            onSave={(v) => handleUpdateField(kpi.id, 'signoffStatus', v)}
                            type="select"
                            options={['Pending', 'Submitted', 'Approved']}
                            editable={isAdmin}
                          />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <EditableCell
                            value={kpi.owner || ''}
                            onSave={(v) => handleUpdateField(kpi.id, 'owner', v)}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.devStatus, 'devStatus')}`}>
                          <EditableCell
                            value={kpi.devStatus}
                            onSave={(v) => handleUpdateField(kpi.id, 'devStatus', v)}
                            type="select"
                            options={['Not Started', 'In Progress', 'Ready for SIT', 'Ready for SIT - until Sep', 'Ready for SIT - may Failed', 'Completed', 'Onhold']}
                            bgColor={getCellBgColor(kpi.devStatus, 'devStatus')}
                            editable={isAdmin}
                          />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <EditableCell
                            value={kpi.remarks || ''}
                            onSave={(v) => handleUpdateField(kpi.id, 'remarks', v)}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.customerDependencyStatus, 'customerDependency')}`}>
                          <EditableCell
                            value={kpi.customerDependencyStatus || 'None'}
                            onSave={(v) => handleUpdateField(kpi.id, 'customerDependencyStatus', v)}
                            type="select"
                            options={['None', 'PENDING CUSTOMER FOR DATA', 'Inprogress', 'Not Started', 'Done', 'Passed', 'Failed', 'Dev Pending - Lawrance', 'Dependent on revisions', 'Dependent on VAT']}
                            bgColor={getCellBgColor(kpi.customerDependencyStatus, 'customerDependency')}
                            textColor={kpi.customerDependencyStatus?.includes('PENDING') ? 'text-white' : 'text-slate-800'}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.revisedDevStatus, 'revisedDevStatus')}`}>
                          <EditableCell
                            value={kpi.revisedDevStatus || 'Not Started'}
                            onSave={(v) => handleUpdateField(kpi.id, 'revisedDevStatus', v)}
                            type="select"
                            options={['Not Started', 'In Progress', 'Completed', 'Passed', 'Failed', 'Done', 'Onhold', '?']}
                            bgColor={getCellBgColor(kpi.revisedDevStatus, 'revisedDevStatus')}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.sitStatus, 'sitStatus')}`}>
                          <EditableCell
                            value={kpi.sitStatus}
                            onSave={(v) => handleUpdateField(kpi.id, 'sitStatus', v)}
                            type="select"
                            options={['Not Started', 'Pending', 'In Progress', 'Passed', 'Failed', 'Can we put in UAT?', 'Can we put in Prod?', 'Ready for SIT - until Sep', 'Ready for SIT - may Failed']}
                            bgColor={getCellBgColor(kpi.sitStatus, 'sitStatus')}
                            textColor={kpi.sitStatus?.includes('PENDING') ? 'text-white' : 'text-slate-800'}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.uatStatus, 'uatStatus')}`}>
                          <EditableCell
                            value={kpi.uatStatus}
                            onSave={(v) => handleUpdateField(kpi.id, 'uatStatus', v)}
                            type="select"
                            options={['Not Started', 'Pending', 'In Progress', 'Passed', 'Failed', 'Can we put in UAT?', 'Can we put in Prod?']}
                            bgColor={getCellBgColor(kpi.uatStatus, 'uatStatus')}
                            textColor={kpi.uatStatus?.includes('PENDING') ? 'text-white' : 'text-slate-800'}
                            editable={isAdmin}
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${getCellBgColor(kpi.prodStatus, 'prodStatus')}`}>
                          <EditableCell
                            value={kpi.prodStatus}
                            onSave={(v) => handleUpdateField(kpi.id, 'prodStatus', v)}
                            type="select"
                            options={['Not Started', 'Pending', 'In Progress', 'Passed', 'Failed', 'Can we put in UAT?', 'Can we put in Prod?']}
                            bgColor={getCellBgColor(kpi.prodStatus, 'prodStatus')}
                            textColor={kpi.prodStatus?.includes('PENDING') ? 'text-white' : 'text-slate-800'}
                            editable={isAdmin}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
            )}
          </motion.div>
        )}
      </main>

      {/* KPI Modal */}
      <KPIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateKPI}
        kpi={null}
        mode="create"
      />
    </div>
  )
}
