import { useState, useEffect, useRef } from 'react'
import { Lock } from 'lucide-react'

interface EditableCellProps {
  value: string | number
  onSave: (value: string | number) => void
  type?: 'text' | 'number' | 'select'
  options?: string[]
  bgColor?: string
  textColor?: string
  editable?: boolean
  showLockIcon?: boolean
}

export default function EditableCell({
  value,
  onSave,
  type = 'text',
  options = [],
  bgColor = 'bg-white',
  textColor = 'text-slate-800',
  editable = true,
  showLockIcon = false,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const isSaving = useRef(false)

  useEffect(() => {
    // Only update if we're not currently editing or saving
    if (!isEditing && !isSaving.current) {
      setEditValue(value)
    }
  }, [value, isEditing])

  const handleSave = async () => {
    if (editValue !== value) {
      isSaving.current = true
      await onSave(editValue)
      isSaving.current = false
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (!editable) {
    return (
      <div className={`px-2 py-1 ${bgColor} ${textColor} text-sm flex items-center gap-2`}>
        {value || '-'}
        {showLockIcon && <Lock className="w-3 h-3 text-slate-400" />}
      </div>
    )
  }

  if (isEditing) {
    if (type === 'select' && options.length > 0) {
      return (
        <select
          value={editValue.toString()}
          onChange={async (e) => {
            const newValue = e.target.value
            setEditValue(newValue)
            if (newValue !== value) {
              isSaving.current = true
              setIsEditing(false)
              await onSave(newValue)
              isSaving.current = false
            } else {
              setIsEditing(false)
            }
          }}
          onBlur={() => {
            if (!isSaving.current) {
              setIsEditing(false)
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`w-full px-2 py-1 text-sm border-2 border-sky-500 focus:outline-none ${textColor}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        type={type}
        value={editValue}
        onChange={(e) =>
          setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)
        }
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`w-full px-2 py-1 text-sm border-2 border-sky-500 focus:outline-none ${textColor}`}
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`px-2 py-1 ${bgColor} ${textColor} text-sm cursor-pointer hover:ring-2 hover:ring-sky-300 transition`}
    >
      {value || '-'}
    </div>
  )
}
