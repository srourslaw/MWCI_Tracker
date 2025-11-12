import { createContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from '../firebase'
import {
  getUserProfile,
  createUserProfile,
  updateEmailVerificationStatus,
  updateLastLogin,
  getUserDomain,
} from '../services/userService'
import { UserProfile } from '../types/user'
import { logger } from '../utils/logger'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshUserProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      let profile = await getUserProfile(firebaseUser.uid)

      // Create profile if it doesn't exist
      if (!profile) {
        profile = await createUserProfile(
          firebaseUser.uid,
          firebaseUser.email!,
          firebaseUser.displayName,
          firebaseUser.emailVerified
        )
      } else {
        // Update email verification status if changed
        if (profile.emailVerified !== firebaseUser.emailVerified) {
          await updateEmailVerificationStatus(
            firebaseUser.uid,
            firebaseUser.emailVerified
          )
          profile = await getUserProfile(firebaseUser.uid)
        }

        // Update last login
        await updateLastLogin(firebaseUser.uid)
      }

      setUserProfile(profile)
    } catch (error) {
      logger.error('Error loading user profile:', error)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // IMPORTANT: Reload user state to get latest email verification status
        // This ensures that when users return from clicking the verification link,
        // we immediately detect their verified status without manual refresh
        try {
          await firebaseUser.reload()
          // Get the updated user object after reload
          const updatedUser = auth.currentUser
          if (updatedUser) {
            setUser(updatedUser)
            await loadUserProfile(updatedUser)
          }
        } catch (error) {
          logger.error('Error reloading user:', error)
          // Fallback to loading profile with existing user data
          await loadUserProfile(firebaseUser)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string) => {
    // Validate email domain
    const domain = getUserDomain(email)

    if (domain !== 'thakralone.com' && domain !== 'manilawater.com') {
      throw new Error(
        'Only @thakralone.com and @manilawater.com email addresses are allowed'
      )
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // SECURITY: Send verification email to ALL users (both domains)
    // This ensures they actually own the email address
    try {
      // Configure the email verification to redirect back to our app
      const actionCodeSettings = {
        url: window.location.origin + '/login?verified=true',
        handleCodeInApp: false,
      }
      await sendEmailVerification(userCredential.user, actionCodeSettings)
      logger.log('Verification email sent to:', email)
    } catch (error) {
      logger.error('Failed to send verification email:', error)
      // Don't throw - user is created, just log the error
    }

    // Create user profile
    await createUserProfile(
      userCredential.user.uid,
      email,
      null,
      false // Email not verified yet
    )
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    refreshUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
