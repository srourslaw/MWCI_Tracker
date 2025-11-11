export interface AuditLog {
  id: string
  kpiId: string
  kpiName: string
  kpiCategory: string
  field: string
  oldValue: string | number
  newValue: string | number
  changedBy: string
  changedByEmail: string
  changedByName: string
  changedAt: Date
  changeType: 'create' | 'update' | 'delete'
}

export interface AuditLogInput {
  kpiId: string
  kpiName: string
  kpiCategory: string
  field: string
  oldValue: string | number
  newValue: string | number
  changedBy: string
  changedByEmail: string
  changedByName: string
  changeType: 'create' | 'update' | 'delete'
}

export interface AuditFilters {
  startDate?: Date
  endDate?: Date
  user?: string
  kpi?: string
  field?: string
}
