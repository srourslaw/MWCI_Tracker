export type KPICategory =
  | 'Consumptions'
  | 'Consumptions, Reversals, Revisions'
  | 'Reversals'
  | 'Revisions'
  | 'Installations'
  | 'Other'

export type DevStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Ready for SIT'
  | 'Ready for SIT - until Sep'
  | 'Ready for SIT - may Failed'
  | 'Completed'
  | 'Onhold'

export type TestingStatus =
  | 'Not Started'
  | 'Pending'
  | 'In Progress'
  | 'Passed'
  | 'Failed'
  | 'Can we put in UAT?'
  | 'Can we put in Prod?'
  | 'Ready for SIT - until Sep'
  | 'Ready for SIT - may Failed'

export type SignoffStatus = 'Pending' | 'Submitted' | 'Approved'

export type CustomerDependencyStatus =
  | 'None'
  | 'PENDING CUSTOMER FOR DATA'
  | 'Inprogress'
  | 'Not Started'
  | 'Done'
  | 'Passed'
  | 'Failed'
  | 'Dev Pending - Lawrance'
  | 'Dependent on revisions'
  | 'Dependent on VAT'
  | string

export type RevisedDevStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Passed'
  | 'Failed'
  | 'Done'
  | 'Onhold'
  | '?'
  | string

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

  // Excel-specific fields
  owner?: string
  remarks?: string
  remarksDate?: string // e.g., "10/11"
  customerDependency?: string
  customerDependencyStatus?: CustomerDependencyStatus
  customerDependencyDate?: string // e.g., "11-Nov"
  revisedDevStatus?: RevisedDevStatus
  revisedDevStatusDate?: string // e.g., "11-Nov"
  targetDate?: string

  // Additional details
  specificDetails?: string // For detailed remarks/notes
  jiraTicket?: string

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
