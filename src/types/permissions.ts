export type ColumnName =
  | 'category'
  | 'name'
  | 'signoffStatus'
  | 'owner'
  | 'devStatus'
  | 'devCompletion'
  | 'remarks'
  | 'customerDependency'
  | 'customerDependencyStatus'
  | 'revisedDevStatus'
  | 'sitStatus'
  | 'sitCompletion'
  | 'uatStatus'
  | 'uatCompletion'
  | 'prodStatus'
  | 'prodCompletion'

export interface ColumnPermission {
  id: string
  columnName: ColumnName
  columnDisplayName: string
  assignedUsers: string[] // Array of user emails
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ColumnPermissionInput {
  columnName: ColumnName
  columnDisplayName: string
  assignedUsers: string[]
}

// Helper to get display name for columns
export const COLUMN_DISPLAY_NAMES: Record<ColumnName, string> = {
  category: 'Category',
  name: 'KPI Name',
  signoffStatus: 'Customer Signoff Status',
  owner: 'Owner',
  devStatus: 'DEV Status',
  devCompletion: 'DEV Completion %',
  remarks: 'Remarks',
  customerDependency: 'Customer Dependency',
  customerDependencyStatus: 'Customer Dependency Status',
  revisedDevStatus: 'Revised Dev Status',
  sitStatus: 'SIT Status',
  sitCompletion: 'SIT Completion %',
  uatStatus: 'UAT Status',
  uatCompletion: 'UAT Completion %',
  prodStatus: 'PROD Status',
  prodCompletion: 'PROD Completion %',
}

// Columns that should always be editable by admins
export const ADMIN_ALWAYS_EDITABLE: ColumnName[] = [
  'category',
  'name',
  'signoffStatus',
  'owner',
  'devStatus',
  'devCompletion',
  'remarks',
  'customerDependency',
  'customerDependencyStatus',
  'revisedDevStatus',
  'sitStatus',
  'sitCompletion',
  'uatStatus',
  'uatCompletion',
  'prodStatus',
  'prodCompletion',
]
