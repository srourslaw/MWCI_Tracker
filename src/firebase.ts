import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { setLogLevel } from 'firebase/app'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Suppress Firebase internal warnings in production
// In development, only show errors to reduce noise
if (import.meta.env.PROD) {
  setLogLevel('silent')
} else {
  setLogLevel('error')
}

// Suppress browser network errors in console (development only visual cleanup)
// Note: Network errors like "Failed to load resource" are browser-level and expected
// when WebSocket connections timeout during idle periods. Firebase auto-reconnects.
if (import.meta.env.DEV) {
  // Global error handler to catch and suppress harmless network errors
  const originalError = console.error
  console.error = (...args: any[]) => {
    // Suppress Firebase WebSocket/channel network errors (they auto-reconnect)
    const errorMessage = args.join(' ')
    if (
      errorMessage.includes('Failed to load resource') ||
      errorMessage.includes('network connection was lost') ||
      errorMessage.includes('channel')
    ) {
      // Silently ignore - Firebase handles reconnection automatically
      return
    }
    // Pass through all other errors
    originalError.apply(console, args)
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Enable offline persistence for better reliability
// This suppresses connection warnings and provides offline support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firestore persistence failed: Multiple tabs open')
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.warn('Firestore persistence not available in this browser')
  }
})

export default app
