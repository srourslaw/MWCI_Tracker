export type DeliverablePhase = 'BR-FSD' | 'Development' | 'SIT' | 'UAT' | 'Cut-over'

export type BugStatus =
  | 'Created'
  | 'Under Review'
  | 'Data Issue'
  | 'Logic Issue'
  | 'In Fix'
  | 'Closed'
  | 'Retest Required'

export interface Bug {
  bugId: string
  description: string
  createdDate: string
  status: BugStatus
  assignedTo: string
  reviewDate?: string
  dataIssueDate?: string
  logicIssueDate?: string
  fixDate?: string
  closedDate?: string
  retestDate?: string
}

export interface WorkflowStage {
  targetDate: string // ISO date string
  actualDate: string // ISO date string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'
  notes?: string
}

export interface Deliverable {
  id: string
  kpiName: string
  category: string
  phase: DeliverablePhase

  // BR-FSD Phase
  designSignoff: WorkflowStage

  // Development Phase
  developmentCompletion: WorkflowStage

  // SIT Phase
  testingCompletion: WorkflowStage
  testingFailed1stReview: WorkflowStage
  testingFailed1stRectification: WorkflowStage
  testingFailed1stClarification: WorkflowStage // Business dependency
  testingFailed1stFix: WorkflowStage
  testingFailed1stRetest: WorkflowStage
  testingFailed2ndInvestigation: WorkflowStage
  testingPassedSIT: WorkflowStage

  // UAT Phase
  uatReadinessTesting: WorkflowStage
  uatTestingStart: WorkflowStage
  uatTestingEnd: WorkflowStage
  uatPassSignoff: WorkflowStage

  // Bug Tracking
  bugs: Bug[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastUpdatedBy?: string
}

export interface DeliverableInput {
  kpiName: string
  category: string
  phase: DeliverablePhase

  designSignoff: WorkflowStage
  developmentCompletion: WorkflowStage
  testingCompletion: WorkflowStage
  testingFailed1stReview: WorkflowStage
  testingFailed1stRectification: WorkflowStage
  testingFailed1stClarification: WorkflowStage
  testingFailed1stFix: WorkflowStage
  testingFailed1stRetest: WorkflowStage
  testingFailed2ndInvestigation: WorkflowStage
  testingPassedSIT: WorkflowStage
  uatReadinessTesting: WorkflowStage
  uatTestingStart: WorkflowStage
  uatTestingEnd: WorkflowStage
  uatPassSignoff: WorkflowStage
  bugs: Bug[]
}

// Helper to create an empty workflow stage
export const createEmptyStage = (): WorkflowStage => ({
  targetDate: '',
  actualDate: '',
  status: 'Not Started',
  notes: ''
})

// Helper to create an empty deliverable input
export const createEmptyDeliverableInput = (kpiName: string, category: string): DeliverableInput => ({
  kpiName,
  category,
  phase: 'BR-FSD',
  designSignoff: createEmptyStage(),
  developmentCompletion: createEmptyStage(),
  testingCompletion: createEmptyStage(),
  testingFailed1stReview: createEmptyStage(),
  testingFailed1stRectification: createEmptyStage(),
  testingFailed1stClarification: createEmptyStage(),
  testingFailed1stFix: createEmptyStage(),
  testingFailed1stRetest: createEmptyStage(),
  testingFailed2ndInvestigation: createEmptyStage(),
  testingPassedSIT: createEmptyStage(),
  uatReadinessTesting: createEmptyStage(),
  uatTestingStart: createEmptyStage(),
  uatTestingEnd: createEmptyStage(),
  uatPassSignoff: createEmptyStage(),
  bugs: []
})
