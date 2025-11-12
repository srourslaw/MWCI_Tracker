import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  User,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Upload
} from 'lucide-react'
import { deliverableService } from '../services/deliverableService'
import { Deliverable, DeliverablePhase, WorkflowStage } from '../types/deliverable'
import { getTeamMemberName } from '../data/teamMembers'
import { logger } from '../utils/logger'
import { importInitialDeliverables } from '../utils/importDeliverables'

export default function DeliverablesTracker() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<DeliverablePhase | 'all'>('all')
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [importing, setImporting] = useState(false)

  const isAdmin = user?.email === 'hussein.srour@thakralone.com'

  // Subscribe to deliverables
  useEffect(() => {
    if (!user) return

    const unsubscribe = deliverableService.subscribeToDeliverables(
      (updatedDeliverables) => {
        setDeliverables(updatedDeliverables)
        setLoading(false)

        // Auto-select first deliverable if none selected
        if (!selectedDeliverable && updatedDeliverables.length > 0) {
          setSelectedDeliverable(updatedDeliverables[0])
        }
      },
      (error) => {
        logger.error('Error loading deliverables:', error)
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
      logger.error('Failed to log out:', error)
    }
  }

  const handleUpdateStage = async (
    stageName: keyof Deliverable,
    stageData: WorkflowStage
  ) => {
    if (!selectedDeliverable || !user) return

    try {
      await deliverableService.updateWorkflowStage(
        selectedDeliverable.id,
        stageName as any,
        stageData,
        user.uid
      )
      logger.log(`Updated ${stageName}`)
    } catch (error) {
      logger.error('Error updating stage:', error)
    }
  }

  const handleImportDeliverables = async () => {
    if (!user) return

    if (!confirm('This will import deliverables from KPI data. Continue?')) {
      return
    }

    setImporting(true)
    try {
      const result = await importInitialDeliverables(user.uid)
      alert(`Import complete!\n\nSuccessful: ${result.success}\nFailed: ${result.failed}\n\nThe deliverables are ready for tracking!`)
      if (result.errors.length > 0) {
        logger.error('Import errors:', result.errors)
      }
    } catch (error) {
      logger.error('Import failed:', error)
      alert('Import failed. Check console for details.')
    } finally {
      setImporting(false)
    }
  }

  const phases: (DeliverablePhase | 'all')[] = ['all', 'BR-FSD', 'Development', 'SIT', 'UAT', 'Cut-over']

  const filteredDeliverables = deliverables.filter((d) => {
    const matchesPhase = selectedPhase === 'all' || d.phase === selectedPhase
    const matchesSearch =
      d.kpiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPhase && matchesSearch
  })

  const getStageStatus = (stage: WorkflowStage): 'completed' | 'in-progress' | 'delayed' | 'not-started' => {
    if (stage.actualDate) return 'completed'
    if (stage.status === 'In Progress') return 'in-progress'
    if (stage.targetDate && new Date(stage.targetDate) < new Date()) return 'delayed'
    return 'not-started'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'in-progress':
        return <Clock className="w-4 h-4" />
      case 'delayed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const workflowStages = [
    { key: 'designSignoff', label: 'Design Signoff' },
    { key: 'developmentCompletion', label: 'Development Completion' },
    { key: 'testingCompletion', label: 'Testing Completion' },
    { key: 'testingFailed1stReview', label: 'Testing Failed (1st Review for Fix)' },
    { key: 'testingFailed1stRectification', label: 'Testing Failed (1st Rectification)' },
    { key: 'testingFailed1stClarification', label: 'Testing Failed (1st Clarification - Business Dependency)' },
    { key: 'testingFailed1stFix', label: 'Testing Failed (1st Fix)' },
    { key: 'testingFailed1stRetest', label: 'Testing Failed (1st Retest)' },
    { key: 'testingFailed2ndInvestigation', label: 'Testing Failed 2 (2nd Investigation)' },
    { key: 'testingPassedSIT', label: 'Testing Passed - SIT' },
    { key: 'uatReadinessTesting', label: 'UAT Readiness Testing' },
    { key: 'uatTestingStart', label: 'UAT Testing Start' },
    { key: 'uatTestingEnd', label: 'UAT Testing End' },
    { key: 'uatPassSignoff', label: 'UAT Pass Signoff' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white flex">
      {/* Left Sidebar - Deliverables List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Deliverables</h2>
              <p className="text-xs text-slate-600">BI Report KPIs</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables..."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Deliverables List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-slate-600 text-sm mt-2">Loading...</p>
            </div>
          ) : filteredDeliverables.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-slate-600 text-sm">No deliverables found</p>
              <p className="text-slate-500 text-xs mt-1">
                {deliverables.length === 0 ? 'Import initial data to get started' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredDeliverables.map((deliverable) => (
              <button
                key={deliverable.id}
                onClick={() => setSelectedDeliverable(deliverable)}
                className={`w-full text-left p-3 border-b border-slate-100 hover:bg-sky-50 transition ${
                  selectedDeliverable?.id === deliverable.id ? 'bg-sky-50 border-l-4 border-l-sky-500' : ''
                }`}
              >
                <p className="text-sm font-medium text-slate-800 line-clamp-2">{deliverable.kpiName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {deliverable.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    deliverable.phase === 'BR-FSD' ? 'bg-purple-100 text-purple-700' :
                    deliverable.phase === 'Development' ? 'bg-blue-100 text-blue-700' :
                    deliverable.phase === 'SIT' ? 'bg-yellow-100 text-yellow-700' :
                    deliverable.phase === 'UAT' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {deliverable.phase}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-morphism border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Deliverables Tracker</h1>
                <p className="text-sm text-slate-600">Detailed workflow tracking for all deliverables</p>
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

        {/* Phase Filter Buttons */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700 mr-2">Filter by Phase:</span>
              {phases.map((phase) => (
                <motion.button
                  key={phase}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPhase === phase
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {phase === 'all' ? 'All Phases' : phase}
                </motion.button>
              ))}
            </div>

            {/* Import Button (Admin Only) */}
            {isAdmin && deliverables.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImportDeliverables}
                disabled={importing}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importing...' : 'Import from KPIs'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Workflow Table */}
        <main className="flex-1 overflow-auto p-6">
          {!selectedDeliverable ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">No Deliverable Selected</p>
                <p className="text-slate-500 text-sm mt-2">Select a deliverable from the sidebar to view its workflow</p>
              </div>
            </div>
          ) : (
            <div className="glass-morphism rounded-2xl p-6">
              {/* Deliverable Header */}
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedDeliverable.kpiName}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {selectedDeliverable.category}
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    selectedDeliverable.phase === 'BR-FSD' ? 'bg-purple-100 text-purple-700' :
                    selectedDeliverable.phase === 'Development' ? 'bg-blue-100 text-blue-700' :
                    selectedDeliverable.phase === 'SIT' ? 'bg-yellow-100 text-yellow-700' :
                    selectedDeliverable.phase === 'UAT' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Phase: {selectedDeliverable.phase}
                  </span>
                </div>
              </div>

              {/* Workflow Stages Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left p-3 font-bold text-slate-700 bg-slate-50">Workflow Stage</th>
                      <th className="text-center p-3 font-bold text-slate-700 bg-slate-50">Target Date</th>
                      <th className="text-center p-3 font-bold text-slate-700 bg-slate-50">Actual Date</th>
                      <th className="text-center p-3 font-bold text-slate-700 bg-slate-50">Status</th>
                      <th className="text-left p-3 font-bold text-slate-700 bg-slate-50">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowStages.map(({ key, label }) => {
                      const stage = selectedDeliverable[key as keyof Deliverable] as WorkflowStage
                      const status = getStageStatus(stage)

                      return (
                        <tr key={key} className="border-b border-slate-200 hover:bg-slate-50 transition">
                          <td className="p-3 font-medium text-slate-800">{label}</td>
                          <td className="p-3 text-center">
                            <input
                              type="date"
                              value={stage.targetDate || ''}
                              onChange={(e) =>
                                handleUpdateStage(key as keyof Deliverable, {
                                  ...stage,
                                  targetDate: e.target.value,
                                })
                              }
                              disabled={!isAdmin}
                              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="date"
                              value={stage.actualDate || ''}
                              onChange={(e) =>
                                handleUpdateStage(key as keyof Deliverable, {
                                  ...stage,
                                  actualDate: e.target.value,
                                  status: e.target.value ? 'Completed' : stage.status,
                                })
                              }
                              disabled={!isAdmin}
                              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3">
                            <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              <span className="capitalize">{status.replace('-', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={stage.notes || ''}
                              onChange={(e) =>
                                handleUpdateStage(key as keyof Deliverable, {
                                  ...stage,
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Add notes..."
                              disabled={!isAdmin}
                              className="w-full px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bug Tracking Section */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-4">UAT Bug Tracking</h4>
                {selectedDeliverable.bugs.length === 0 ? (
                  <p className="text-slate-600 text-sm">No bugs reported yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDeliverable.bugs.map((bug) => (
                      <div key={bug.bugId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800">Bug #{bug.bugId}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bug.status === 'Closed' ? 'bg-green-100 text-green-700' :
                            bug.status === 'In Fix' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {bug.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{bug.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                          <span>Assigned to: {bug.assignedTo}</span>
                          <span>Created: {new Date(bug.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
