import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { logger } from '../utils/logger'

const TWO_FACTOR_COLLECTION = 'twoFactorCodes'
const CODE_EXPIRY_MINUTES = 10 // Code expires in 10 minutes

interface TwoFactorCode {
  userId: string
  code: string
  email: string
  createdAt: Date
  expiresAt: Date
  verified: boolean
}

/**
 * Generate a random 6-digit code
 */
export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Create and store 2FA code
 */
export const createTwoFactorCode = async (
  userId: string,
  email: string
): Promise<string> => {
  try {
    // Delete any existing codes for this user
    await deleteUserCodes(userId)

    const code = generateCode()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60000)

    const twoFactorCode: TwoFactorCode = {
      userId,
      code,
      email,
      createdAt: now,
      expiresAt,
      verified: false,
    }

    await setDoc(doc(db, TWO_FACTOR_COLLECTION, userId), {
      userId: twoFactorCode.userId,
      code: twoFactorCode.code,
      email: twoFactorCode.email,
      createdAt: Timestamp.fromDate(twoFactorCode.createdAt),
      expiresAt: Timestamp.fromDate(twoFactorCode.expiresAt),
      verified: twoFactorCode.verified,
    })

    logger.log('2FA code created for user:', userId)
    return code
  } catch (error) {
    logger.error('Error creating 2FA code:', error)
    throw error
  }
}

/**
 * Verify 2FA code
 */
export const verifyTwoFactorCode = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, TWO_FACTOR_COLLECTION, userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      logger.warn('No 2FA code found for user:', userId)
      return false
    }

    const data = docSnap.data()
    const expiresAt = data.expiresAt.toDate()
    const now = new Date()

    // Check if code is expired
    if (now > expiresAt) {
      logger.warn('2FA code expired for user:', userId)
      await deleteDoc(docRef)
      return false
    }

    // Check if code matches
    if (data.code !== code) {
      logger.warn('Invalid 2FA code for user:', userId)
      return false
    }

    // Check if already verified
    if (data.verified) {
      logger.warn('2FA code already used for user:', userId)
      return false
    }

    // Mark as verified
    await setDoc(
      docRef,
      {
        verified: true,
      },
      { merge: true }
    )

    logger.log('2FA code verified successfully for user:', userId)
    return true
  } catch (error) {
    logger.error('Error verifying 2FA code:', error)
    return false
  }
}

/**
 * Delete user's 2FA codes
 */
export const deleteUserCodes = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, TWO_FACTOR_COLLECTION, userId)
    await deleteDoc(docRef)
    logger.log('Deleted 2FA codes for user:', userId)
  } catch (error) {
    // Ignore error if document doesn't exist
    if ((error as any).code !== 'not-found') {
      logger.error('Error deleting 2FA codes:', error)
    }
  }
}

/**
 * Send 2FA code via email
 * Note: This uses Firebase's email sending, so it's FREE
 */
export const send2FACodeEmail = async (
  email: string,
  code: string,
  userName: string
): Promise<void> => {
  try {
    // For now, we'll log the code (in production, this would send via email service)
    // Since Firebase doesn't have a built-in way to send custom emails on free tier,
    // we'll need to use Firebase Functions or a third-party service

    // TODO: Implement actual email sending
    // For now, the code will be displayed in the console
    logger.log('2FA Code for', email, ':', code)
    logger.log(
      '📧 Email would be sent:',
      `Hello ${userName}, Your MWCI Tracker verification code is: ${code}. This code expires in ${CODE_EXPIRY_MINUTES} minutes.`
    )

    // In a real implementation, you would:
    // 1. Use Firebase Cloud Functions to send email
    // 2. Or use a service like SendGrid/Mailgun
    // 3. Or use Firebase Extensions (Email Trigger)
  } catch (error) {
    logger.error('Error sending 2FA email:', error)
    throw error
  }
}

/**
 * Get remaining time for code expiry
 */
export const getCodeExpiryTime = async (userId: string): Promise<number | null> => {
  try {
    const docRef = doc(db, TWO_FACTOR_COLLECTION, userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    const expiresAt = data.expiresAt.toDate()
    const now = new Date()
    const remainingMs = expiresAt.getTime() - now.getTime()

    return Math.max(0, Math.floor(remainingMs / 1000)) // Return seconds
  } catch (error) {
    logger.error('Error getting code expiry time:', error)
    return null
  }
}

/**
 * Clean up expired codes (should be run periodically)
 */
export const cleanupExpiredCodes = async (): Promise<void> => {
  try {
    const now = new Date()
    const q = query(
      collection(db, TWO_FACTOR_COLLECTION),
      where('expiresAt', '<', Timestamp.fromDate(now))
    )

    const snapshot = await getDocs(q)
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    logger.log('Cleaned up', snapshot.size, 'expired 2FA codes')
  } catch (error) {
    logger.error('Error cleaning up expired codes:', error)
  }
}
