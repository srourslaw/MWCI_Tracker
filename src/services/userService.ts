import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { UserProfile, ApprovalStatus, UserDomain } from '../types/user'
import { logger } from '../utils/logger'

const USERS_COLLECTION = 'users'

/**
 * Get domain from email
 */
export const getUserDomain = (email: string): UserDomain => {
  const domain = email.split('@')[1]?.toLowerCase()

  if (domain === 'thakralone.com') return 'thakralone.com'
  if (domain === 'manilawater.com') return 'manilawater.com'
  return 'other'
}

/**
 * Determine initial approval status based on domain
 */
export const getInitialApprovalStatus = (
  domain: UserDomain,
  emailVerified: boolean
): ApprovalStatus => {
  // Other domains are rejected
  if (domain === 'other') return 'rejected'

  // SECURITY FIX: @thakralone.com users auto-approved ONLY AFTER email verification
  // This ensures they actually own the @thakralone.com email address
  if (domain === 'thakralone.com') {
    return emailVerified ? 'approved' : 'pending'
  }

  // @manilawater.com users need email verification AND admin approval
  if (domain === 'manilawater.com') {
    return emailVerified ? 'pending' : 'pending'
  }

  // Default to pending
  return 'pending'
}

/**
 * Create or update user profile
 */
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string | null,
  emailVerified: boolean
): Promise<UserProfile> => {
  const domain = getUserDomain(email)

  const approvalStatus = getInitialApprovalStatus(domain, emailVerified)

  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    emailVerified,
    approvalStatus,
    domain,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  }

  // SECURITY FIX: Auto-approve @thakralone.com users ONLY if email is verified
  // This ensures they actually own the @thakralone.com email address
  if (domain === 'thakralone.com' && emailVerified) {
    userProfile.approvedBy = 'system'
    userProfile.approvedAt = new Date()
  }

  const firestoreData: any = {
    uid: userProfile.uid,
    email: userProfile.email,
    displayName: userProfile.displayName,
    emailVerified: userProfile.emailVerified,
    approvalStatus: userProfile.approvalStatus,
    domain: userProfile.domain,
    createdAt: Timestamp.fromDate(userProfile.createdAt),
    lastLoginAt: Timestamp.fromDate(userProfile.lastLoginAt!),
  }

  if (userProfile.approvedBy) {
    firestoreData.approvedBy = userProfile.approvedBy
  }

  if (userProfile.approvedAt) {
    firestoreData.approvedAt = Timestamp.fromDate(userProfile.approvedAt)
  }

  await setDoc(doc(db, USERS_COLLECTION, uid), firestoreData)

  logger.log('User profile created:', { email, domain, approvalStatus })
  return userProfile
}

/**
 * Get user profile
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      uid: docSnap.id,
      email: data.email,
      displayName: data.displayName,
      emailVerified: data.emailVerified,
      approvalStatus: data.approvalStatus,
      domain: data.domain,
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt?.toDate(),
      rejectedBy: data.rejectedBy,
      rejectedAt: data.rejectedAt?.toDate(),
      createdAt: data.createdAt.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate(),
    }
  } catch (error) {
    logger.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update user profile after email verification
 */
export const updateEmailVerificationStatus = async (
  uid: string,
  emailVerified: boolean
): Promise<void> => {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) {
      logger.error('User profile not found for uid:', uid)
      return
    }

    // SECURITY FIX: Use getInitialApprovalStatus for all users
    // @thakralone.com users get auto-approved ONLY if email is verified
    const newApprovalStatus = getInitialApprovalStatus(profile.domain, emailVerified)

    const updates: any = {
      emailVerified,
      approvalStatus: newApprovalStatus,
    }

    // Auto-approve @thakralone.com users ONLY if email is verified
    // This ensures they actually own the @thakralone.com email address
    if (profile.domain === 'thakralone.com' && emailVerified) {
      updates.approvedBy = 'system'
      updates.approvedAt = Timestamp.now()
    }

    await updateDoc(doc(db, USERS_COLLECTION, uid), updates)
    logger.log('Email verification status updated:', { uid, emailVerified, newApprovalStatus })
  } catch (error) {
    logger.error('Error updating email verification:', error)
    throw error
  }
}

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      lastLoginAt: Timestamp.now(),
    })
  } catch (error) {
    logger.error('Error updating last login:', error)
  }
}

/**
 * Approve user (admin action)
 */
export const approveUser = async (uid: string, adminEmail: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      approvalStatus: 'approved',
      approvedBy: adminEmail,
      approvedAt: Timestamp.now(),
      rejectedBy: null,
      rejectedAt: null,
    })
    logger.log('User approved:', { uid, adminEmail })
  } catch (error) {
    logger.error('Error approving user:', error)
    throw error
  }
}

/**
 * Reject user (admin action)
 */
export const rejectUser = async (uid: string, adminEmail: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      approvalStatus: 'rejected',
      rejectedBy: adminEmail,
      rejectedAt: Timestamp.now(),
      approvedBy: null,
      approvedAt: null,
    })
    logger.log('User rejected:', { uid, adminEmail })
  } catch (error) {
    logger.error('Error rejecting user:', error)
    throw error
  }
}

/**
 * Subscribe to pending approval requests
 */
export const subscribeToPendingApprovals = (
  callback: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('approvalStatus', '==', 'pending'),
    where('emailVerified', '==', true)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const users: UserProfile[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          emailVerified: data.emailVerified,
          approvalStatus: data.approvalStatus,
          domain: data.domain,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt?.toDate(),
          rejectedBy: data.rejectedBy,
          rejectedAt: data.rejectedAt?.toDate(),
          createdAt: data.createdAt.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        }
      })
      callback(users)
    },
    (error) => {
      logger.error('Error in pending approvals subscription:', error)
      onError?.(error as Error)
    }
  )
}

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION))
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        emailVerified: data.emailVerified,
        approvalStatus: data.approvalStatus,
        domain: data.domain,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt?.toDate(),
        rejectedBy: data.rejectedBy,
        rejectedAt: data.rejectedAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
      }
    })
  } catch (error) {
    logger.error('Error fetching all users:', error)
    return []
  }
}

/**
 * Check if user is approved
 */
export const isUserApproved = (profile: UserProfile | null): boolean => {
  if (!profile) return false

  // SECURITY FIX: @thakralone.com users must verify email first
  // This ensures they actually own the @thakralone.com email address
  // After verification, they're auto-approved (no admin approval needed)
  if (profile.domain === 'thakralone.com') {
    return profile.emailVerified && profile.approvalStatus === 'approved'
  }

  // @manilawater.com users need email verification AND admin approval
  return profile.emailVerified && profile.approvalStatus === 'approved'
}

/**
 * Get approval status message
 */
export const getApprovalMessage = (profile: UserProfile | null): string => {
  if (!profile) return 'User profile not found'

  if (!profile.emailVerified) {
    return 'Please verify your email address. Check your inbox for the verification link.'
  }

  if (profile.domain === 'other') {
    return 'Access denied. Only @thakralone.com and @manilawater.com email addresses are allowed.'
  }

  if (profile.approvalStatus === 'pending') {
    if (profile.domain === 'manilawater.com') {
      return 'Your account is pending approval from the administrator. You will receive an email once approved.'
    }
    // @thakralone.com users pending because email not verified yet
    return 'Please verify your email address to activate your account. Check your inbox for the verification link.'
  }

  if (profile.approvalStatus === 'rejected') {
    return 'Your account access has been denied. Please contact the administrator for more information.'
  }

  return 'Access granted'
}
