import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Save, X } from 'lucide-react'
import { permissionsService } from '../services/permissionsService'
import { ColumnPermission, ColumnName, COLUMN_DISPLAY_NAMES } from '../types/permissions'
import { logger } from '../utils/logger'

const TEAM_MEMBERS = [
  'hussein.srour@thakralone.com',
  'joy.cata@example.com',
  'francis.dizon@example.com',
  'joliver.macatuggal@example.com',
  'joshua.gutierrez@example.com',
  'regie.langomes@example.com',
  'john.abuzo@example.com',
  'ferdinand.pimentel@example.com',
  'alexander.gutierrez@example.com',
  'gernan.elgarico@example.com',
  'jojo.ramal@example.com',
  'windy.taghoy@example.com',
  'mallaiah.jatla@example.com',
  'manoj.kachhap@example.com',
  'petros.moutsopoulos@example.com',
  'mac.mann@example.com',
  'carlos.castro@example.com',
  'mauro.scarpa@example.com',
]

interface Props {
  userId: string
}

export default function ColumnPermissionsManager({ userId }: Props) {
  const [permissions, setPermissions] = useState<ColumnPermission[]>([])
  const [editingColumn, setEditingColumn] = useState<ColumnName | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = permissionsService.subscribeToPermissions(
      (perms) => setPermissions(perms),
      (error) => logger.error('Error loading permissions:', error)
    )
    return unsubscribe
  }, [])

  const handleEditColumn = (columnName: ColumnName) => {
    const existing = permissions.find((p) => p.columnName === columnName)
    setEditingColumn(columnName)
    setSelectedUsers(existing?.assignedUsers || [])
  }

  const handleSave = async () => {
    if (!editingColumn) return

    setSaving(true)
    try {
      await permissionsService.setColumnPermission(userId, {
        columnName: editingColumn,
        columnDisplayName: COLUMN_DISPLAY_NAMES[editingColumn],
        assignedUsers: selectedUsers,
      })
      setEditingColumn(null)
      setSelectedUsers([])
    } catch (error) {
      logger.error('Error saving permission:', error)
      alert('Failed to save permission')
    } finally {
      setSaving(false)
    }
  }

  const toggleUser = (email: string) => {
    setSelectedUsers((prev) =>
      prev.includes(email) ? prev.filter((u) => u !== email) : [...prev, email]
    )
  }

  const allColumns: ColumnName[] = Object.keys(COLUMN_DISPLAY_NAMES) as ColumnName[]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Column Permissions</h2>
          <p className="text-sm text-slate-600">
            Assign users who can edit specific columns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allColumns.map((columnName) => {
          const permission = permissions.find((p) => p.columnName === columnName)
          const assignedCount = permission?.assignedUsers.length || 0

          return (
            <motion.div
              key={columnName}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 border-2 border-slate-200 hover:border-sky-300 transition cursor-pointer"
              onClick={() => handleEditColumn(columnName)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {COLUMN_DISPLAY_NAMES[columnName]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {assignedCount === 0
                      ? 'Admin only'
                      : `${assignedCount} user${assignedCount > 1 ? 's' : ''} assigned`}
                  </p>
                </div>
                <Shield className={`w-5 h-5 ${assignedCount > 0 ? 'text-green-500' : 'text-slate-300'}`} />
              </div>
              {assignedCount > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {permission!.assignedUsers.slice(0, 2).map((email) => (
                    <span
                      key={email}
                      className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs"
                    >
                      {email.split('@')[0]}
                    </span>
                  ))}
                  {assignedCount > 2 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      +{assignedCount - 2}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Edit Permissions: {COLUMN_DISPLAY_NAMES[editingColumn]}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Select users who can edit this column
                </p>
              </div>
              <button
                onClick={() => setEditingColumn(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {TEAM_MEMBERS.map((email) => (
                <label
                  key={email}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(email)}
                    onChange={() => toggleUser(email)}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{email}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Permissions'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingColumn(null)}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
