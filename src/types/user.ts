/**
 * User approval and verification types
 */

export type ApprovalStatus = 'approved' | 'pending' | 'rejected'

export type UserDomain = 'thakralone.com' | 'manilawater.com' | 'other'

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  emailVerified: boolean
  approvalStatus: ApprovalStatus
  domain: UserDomain
  approvedBy?: string // Admin email who approved
  approvedAt?: Date
  rejectedBy?: string // Admin email who rejected
  rejectedAt?: Date
  createdAt: Date
  lastLoginAt?: Date
}

export interface PendingApproval {
  uid: string
  email: string
  displayName: string | null
  domain: UserDomain
  emailVerified: boolean
  requestedAt: Date
}
