import { useState, useEffect } from 'react'

interface EditableCellProps {
  value: string | number
  onSave: (value: string | number) => void
  type?: 'text' | 'number' | 'select'
  options?: string[]
  bgColor?: string
  textColor?: string
  editable?: boolean
}

export default function EditableCell({
  value,
  onSave,
  type = 'text',
  options = [],
  bgColor = 'bg-white',
  textColor = 'text-slate-800',
  editable = true,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue)
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
      <div className={`px-2 py-1 ${bgColor} ${textColor} text-sm`}>
        {value || '-'}
      </div>
    )
  }

  if (isEditing) {
    if (type === 'select' && options.length > 0) {
      return (
        <select
          value={editValue.toString()}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
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
