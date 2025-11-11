export type KPICategory =
  | 'Consumptions'
  | 'Consumptions, Reversals, Revisions'
  | 'Reversals'
  | 'Revisions'
  | 'Installations'
  | 'Other'

export type DevStatus = 'Not Started' | 'In Progress' | 'Ready for SIT' | 'Completed' | 'Onhold'
export type TestingStatus = 'Not Started' | 'Pending' | 'In Progress' | 'Passed' | 'Failed'
export type SignoffStatus = 'Pending' | 'Submitted' | 'Approved'

export interface KPI {
  id: string
  category: KPICategory
  name: string

  // Status tracking
  signoffStatus: SignoffStatus
  devStatus: DevStatus
  devCompletion: number // 0-100

  // Phase completion
  sitStatus: TestingStatus
  sitCompletion: number // 0-100
  uatStatus: TestingStatus
  uatCompletion: number // 0-100
  prodStatus: TestingStatus
  prodCompletion: number // 0-100

  // Details
  owner?: string
  remarks?: string
  customerDependency?: string
  targetDate?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export type KPIInput = Omit<KPI, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>

// Summary statistics
export interface KPISummary {
  total: number
  notStarted: number
  inProgress: number
  completed: number
  avgDevCompletion: number
  avgSitCompletion: number
  avgUatCompletion: number
  avgProdCompletion: number
}
