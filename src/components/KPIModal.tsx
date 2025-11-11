import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { KPI, KPIInput, KPICategory, SignoffStatus, DevStatus, TestingStatus } from '../types/kpi'

interface KPIModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (kpi: KPIInput) => Promise<void>
  kpi?: KPI | null
  mode: 'create' | 'edit'
}

export default function KPIModal({ isOpen, onClose, onSubmit, kpi, mode }: KPIModalProps) {
  const [formData, setFormData] = useState<KPIInput>({
    category: 'Consumptions' as KPICategory,
    name: '',
    signoffStatus: 'Pending' as SignoffStatus,
    devStatus: 'Not Started' as DevStatus,
    devCompletion: 0,
    sitStatus: 'Not Started' as TestingStatus,
    sitCompletion: 0,
    uatStatus: 'Not Started' as TestingStatus,
    uatCompletion: 0,
    prodStatus: 'Not Started' as TestingStatus,
    prodCompletion: 0,
    owner: '',
    remarks: '',
    customerDependency: '',
    targetDate: '',
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (kpi && mode === 'edit') {
      setFormData({
        category: kpi.category,
        name: kpi.name,
        signoffStatus: kpi.signoffStatus,
        devStatus: kpi.devStatus,
        devCompletion: kpi.devCompletion,
        sitStatus: kpi.sitStatus,
        sitCompletion: kpi.sitCompletion,
        uatStatus: kpi.uatStatus,
        uatCompletion: kpi.uatCompletion,
        prodStatus: kpi.prodStatus,
        prodCompletion: kpi.prodCompletion,
        owner: kpi.owner || '',
        remarks: kpi.remarks || '',
        customerDependency: kpi.customerDependency || '',
        targetDate: kpi.targetDate || '',
      })
    } else {
      setFormData({
        category: 'Consumptions' as KPICategory,
        name: '',
        signoffStatus: 'Pending' as SignoffStatus,
        devStatus: 'Not Started' as DevStatus,
        devCompletion: 0,
        sitStatus: 'Not Started' as TestingStatus,
        sitCompletion: 0,
        uatStatus: 'Not Started' as TestingStatus,
        uatCompletion: 0,
        prodStatus: 'Not Started' as TestingStatus,
        prodCompletion: 0,
        owner: '',
        remarks: '',
        customerDependency: '',
        targetDate: '',
      })
    }
  }, [kpi, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting KPI:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const categories: KPICategory[] = ['Consumptions', 'Reversals', 'Revisions', 'Installations', 'Other']
  const signoffStatuses: SignoffStatus[] = ['Pending', 'Submitted', 'Approved']
  const devStatuses: DevStatus[] = ['Not Started', 'In Progress', 'Ready for SIT', 'Completed', 'Onhold']
  const testingStatuses: TestingStatus[] = ['Not Started', 'Passed', 'Failed', 'In Progress', 'Pending']

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">
                  {mode === 'create' ? 'Add New KPI' : 'Edit KPI'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as KPICategory })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Owner
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Owner name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    KPI Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter KPI name"
                    required
                  />
                </div>

                {/* Sign-off Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sign-off Status
                    </label>
                    <select
                      value={formData.signoffStatus}
                      onChange={(e) => setFormData({ ...formData, signoffStatus: e.target.value as SignoffStatus })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {signoffStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Development Phase */}
                <div className="bg-sky-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Development Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        DEV Status
                      </label>
                      <select
                        value={formData.devStatus}
                        onChange={(e) => setFormData({ ...formData, devStatus: e.target.value as DevStatus })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        {devStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        DEV Completion (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.devCompletion}
                        onChange={(e) => setFormData({ ...formData, devCompletion: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* SIT Phase */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">SIT Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        SIT Status
                      </label>
                      <select
                        value={formData.sitStatus}
                        onChange={(e) => setFormData({ ...formData, sitStatus: e.target.value as TestingStatus })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        {testingStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        SIT Completion (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.sitCompletion}
                        onChange={(e) => setFormData({ ...formData, sitCompletion: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* UAT Phase */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">UAT Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        UAT Status
                      </label>
                      <select
                        value={formData.uatStatus}
                        onChange={(e) => setFormData({ ...formData, uatStatus: e.target.value as TestingStatus })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        {testingStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        UAT Completion (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.uatCompletion}
                        onChange={(e) => setFormData({ ...formData, uatCompletion: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Production Phase */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Production Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        PROD Status
                      </label>
                      <select
                        value={formData.prodStatus}
                        onChange={(e) => setFormData({ ...formData, prodStatus: e.target.value as TestingStatus })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        {testingStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        PROD Completion (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.prodCompletion}
                        onChange={(e) => setFormData({ ...formData, prodCompletion: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter any remarks..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer Dependency
                    </label>
                    <textarea
                      value={formData.customerDependency}
                      onChange={(e) => setFormData({ ...formData, customerDependency: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      rows={2}
                      placeholder="Enter customer dependencies..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Saving...' : mode === 'create' ? 'Add KPI' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
