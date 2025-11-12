# MWCI Tracker - Technical Wiki

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Logger System](#logger-system)
3. [Error Boundary System](#error-boundary-system)
4. [Duplicate Cleanup System](#duplicate-cleanup-system)
5. [Firebase Configuration](#firebase-configuration)
6. [File Structure](#file-structure)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Development Workflow](#development-workflow)

---

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router v6
- **State Management**: React Context + Local State

### Application Flow
```
User → Login/Register → Authentication Check → Role-Based Routing
                                                      ↓
                                    ┌─────────────────┴─────────────────┐
                                    ↓                                   ↓
                            Regular User Dashboard              Admin Dashboard
                                    ↓                                   ↓
                               KPI Tracker                      Full Admin Panel
                            (View/Edit KPIs)                  (Manage Everything)
```

### Key Components Hierarchy
```
App.tsx (Root)
├── ErrorBoundary (Error Protection)
│   └── Router (React Router v6)
│       └── AuthProvider (Authentication Context)
│           └── Routes
│               ├── PublicRoutes (Login, Register)
│               └── PrivateRoutes (Protected)
│                   ├── Dashboard (User)
│                   ├── KPITracker (User + Admin)
│                   ├── AdminDashboard (Admin Only)
│                   └── AuditLog (Admin Only)
```

---

## Logger System

### 📍 Location
`/src/utils/logger.ts`

### Purpose
Centralized logging system that respects environment variables to provide clean console output in production while maintaining full debugging capability in development.

### Implementation Details

```typescript
const isDevelopment = import.meta.env.DEV

export const logger = {
  // Development-only logs
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  // Production-visible logs (errors only)
  error: (...args: any[]) => {
    console.error(...args)
  },

  // Grouped logging
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  },
}
```

### Environment Detection
- **Development**: `import.meta.env.DEV === true`
- **Production**: `import.meta.env.PROD === true`
- **Vite Environment Variables**: Accessed via `import.meta.env.*`

### Migration Pattern

**Before**:
```typescript
console.log('User logged in:', user)
console.warn('Missing field:', field)
console.error('Failed to save:', error)
```

**After**:
```typescript
import { logger } from '../utils/logger'

logger.log('User logged in:', user)      // Dev only
logger.warn('Missing field:', field)     // Dev only
logger.error('Failed to save:', error)   // Always visible
```

### Usage Examples

#### Basic Logging
```typescript
// Simple log
logger.log('KPI loaded successfully')

// With data
logger.log('User data:', { name: user.name, role: user.role })

// Warnings
logger.warn('Deprecated method used')

// Errors (always visible)
logger.error('Failed to fetch KPIs:', error)
```

#### Grouped Logging
```typescript
logger.group('Data Processing')
logger.log('Step 1: Fetching data')
logger.log('Step 2: Transforming data')
logger.log('Step 3: Rendering')
logger.groupEnd()
```

### Files Using Logger
- `/src/pages/KPITracker.tsx` - Main KPI page logging
- `/src/pages/AdminDashboard.tsx` - Admin operations
- `/src/pages/Dashboard.tsx` - User dashboard
- `/src/pages/AuditLog.tsx` - Audit trail logging
- `/src/services/kpiService.ts` - Firestore KPI operations
- `/src/services/auditService.ts` - Audit logging
- `/src/services/permissionsService.ts` - Permission management
- `/src/services/taskService.ts` - Task operations
- `/src/components/ColumnPermissionsManager.tsx` - Permission UI
- `/src/components/KPIModal.tsx` - Modal operations
- `/src/components/EditableCell.tsx` - Cell editing
- `/src/utils/importKPIs.ts` - Import operations
- `/src/components/ErrorBoundary.tsx` - Error handling

---

## Error Boundary System

### 📍 Location
`/src/components/ErrorBoundary.tsx`

### Purpose
React Error Boundary to catch JavaScript errors anywhere in the component tree, log errors, and display fallback UI instead of crashing the entire application.

### Architecture

```
User Action → Component Error Thrown
                    ↓
            Error Boundary Catches
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
  Development Mode        Production Mode
        ↓                       ↓
  Show Error Details      Hide Error Details
  + Stack Trace          Show Generic Message
        ↓                       ↓
    User Actions: "Try Again" | "Go Home"
```

### Implementation Details

#### Class Component (Required for Error Boundaries)
```typescript
class ErrorBoundary extends Component<Props, State> {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error (development only due to logger)
    logger.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState({ error, errorInfo })

    // TODO: Send to error tracking service (Sentry, LogRocket)
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />
    }
    return this.props.children
  }
}
```

### Fallback UI Features

1. **Beautiful Error Display**
   - Gradient background matching app theme
   - Icon with visual error indicator
   - Clear error title and description

2. **Development-Only Error Details**
   ```typescript
   {import.meta.env.DEV && this.state.error && (
     <div className="error-details">
       <pre>{this.state.error.toString()}</pre>
       <pre>{this.state.errorInfo.componentStack}</pre>
     </div>
   )}
   ```

3. **Recovery Actions**
   - **Try Again**: Resets error state, re-renders component tree
   - **Go Home**: Navigates to root URL for safe recovery

### Integration

**App.tsx Root Level**:
```typescript
<ErrorBoundary>
  <Router>
    <AuthProvider>
      <Routes>...</Routes>
    </AuthProvider>
  </Router>
</ErrorBoundary>
```

### Custom Fallback UI

Can provide custom fallback:
```typescript
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

### What It Catches
✅ **Catches**:
- Rendering errors
- Lifecycle method errors
- Constructor errors in child components
- Event handler errors (if they bubble up)

❌ **Does NOT Catch**:
- Errors in event handlers (use try-catch)
- Asynchronous errors (setTimeout, promises)
- Server-side rendering errors
- Errors in Error Boundary itself

### Event Handler Pattern

Since Error Boundaries don't catch event handler errors:
```typescript
const handleSave = async () => {
  try {
    await kpiService.save(data)
  } catch (error) {
    logger.error('Save failed:', error)
    setError(error.message)
  }
}
```

---

## Duplicate Cleanup System

### 📍 Location
`/src/pages/KPITracker.tsx` (lines 257-345, 398-407)

### Purpose
Automatically detect and remove duplicate KPI records from Firestore that were created through multiple imports or manual additions.

### Problem Context

**Original Issue**:
- Firestore had 320+ KPI records
- Only 46 unique KPIs exist
- Duplicates caused by multiple imports
- Manual cleanup was tedious and error-prone

### Solution Architecture

```
App Load → useEffect Triggered
              ↓
    Check Conditions (Admin, Not Loading, Has KPIs)
              ↓
    Group KPIs by name + category
              ↓
    Detect Duplicate Groups
              ↓
    Sort by updatedAt (descending)
              ↓
    Keep Most Recent, Delete Others
              ↓
    Continue Until No Duplicates Found
```

### Implementation Details

#### Automatic Cleanup (Server-Side)
```typescript
useEffect(() => {
  const autoCleanup = async () => {
    // Safety checks
    if (!user || !isAdmin || loading || importing || kpis.length === 0) return

    // Group KPIs by unique key (name + category)
    const kpiMap = new Map<string, KPI[]>()
    kpis.forEach(kpi => {
      const key = `${kpi.category}|||${kpi.name}`
      if (!kpiMap.has(key)) {
        kpiMap.set(key, [])
      }
      kpiMap.get(key)!.push(kpi)
    })

    // Filter to only duplicate groups (length > 1)
    const duplicateGroups = Array.from(kpiMap.values())
      .filter(group => group.length > 1)

    if (duplicateGroups.length > 0) {
      const totalDuplicates = duplicateGroups.reduce(
        (sum, group) => sum + (group.length - 1),
        0
      )

      logger.log(`🧹 Auto-cleaning ${totalDuplicates} duplicate(s)...`)
      setImporting(true)

      try {
        let deleted = 0

        // Process each duplicate group
        for (const duplicates of duplicateGroups) {
          // Sort by updatedAt descending (most recent first)
          duplicates.sort((a, b) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
          )

          // Keep first (most recent), delete rest
          const toDelete = duplicates.slice(1)

          for (const dup of toDelete) {
            logger.log(`Deleting duplicate: ${dup.name} (${dup.id})`)
            await kpiService.deleteKPI(dup.id)
            deleted++
          }
        }

        logger.log(`✅ Deleted ${deleted} duplicate(s)`)
      } catch (error) {
        logger.error('Auto-cleanup failed:', error)
      } finally {
        setImporting(false)
      }
    } else {
      logger.log('✨ No duplicates found - database is clean!')
    }
  }

  autoCleanup()
}, [kpis, loading, user, isAdmin, importing])
```

#### Client-Side Filtering (UI Protection)
```typescript
// Remove any duplicates by ID (in case real-time sync creates temporary dupes)
const seenIds = new Set<string>()
const mergedKPIs = mergedKPIsRaw.filter(kpi => {
  if (seenIds.has(kpi.id)) {
    return false // Silent filtering
  }
  seenIds.add(kpi.id)
  return true
})
```

### Key Design Decisions

1. **Keep Most Recent**
   - Uses `updatedAt` timestamp
   - Assumes most recent has latest data
   - Preserves user edits over old records

2. **Continuous Cleanup**
   - Runs on every component mount/update
   - Continues until no duplicates found
   - Self-healing system

3. **Admin Only**
   - Only admin users can trigger cleanup
   - Prevents accidental deletions
   - Requires proper authentication

4. **Safety Checks**
   - Skips if already importing
   - Skips if loading
   - Skips if no KPIs loaded
   - Prevents race conditions

5. **Silent Client Filtering**
   - No console warnings for filtered duplicates
   - Keeps UI clean
   - Transparent to user

### Results
- **Before**: 320+ Firestore records
- **After**: 42 unique KPI records
- **Improvement**: 87% reduction in database size
- **User Impact**: Zero - transparent operation

---

## Firebase Configuration

### 📍 Location
`/src/firebase.ts`

### Purpose
Initialize Firebase services with production-ready configuration including offline persistence and noise suppression.

### Configuration

```typescript
// Environment variables from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

### Log Level Control

**Problem**: Firebase WebChannel connection warnings cluttering console

**Solution**: Environment-based log levels
```typescript
import { setLogLevel } from 'firebase/app'

if (import.meta.env.PROD) {
  setLogLevel('silent')  // Production: no logs
} else {
  setLogLevel('error')   // Development: only errors
}
```

**Available Log Levels**:
- `silent` - No logs at all
- `error` - Only errors
- `warn` - Errors and warnings
- `info` - Info and above
- `debug` - Everything (verbose)

### Offline Persistence

**Purpose**: Enable offline support and reduce Firestore reads

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore'

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open - persistence can only be enabled in one tab
    console.warn('Firestore persistence failed: Multiple tabs open')
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Firestore persistence not available in this browser')
  }
})
```

**Benefits**:
- Faster app loading (cached data)
- Offline data access
- Reduced Firestore reads (lower costs)
- Better UX in poor network conditions

**Limitations**:
- Only one tab can enable persistence
- Not supported in all browsers
- Requires IndexedDB support

### Exported Services

```typescript
// Authentication
export const auth = getAuth(app)

// Firestore Database
export const db = getFirestore(app)

// Firebase App Instance
export default app
```

### Environment Variables Setup

**Development** (`.env.local`):
```bash
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project
VITE_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Production** (Vercel/Netlify):
Set same variables in deployment platform's environment settings.

---

## File Structure

```
/src
├── /components
│   ├── ColumnPermissionsManager.tsx   [Column permission management UI]
│   ├── EditableCell.tsx               [Editable table cell component]
│   ├── ErrorBoundary.tsx              [Error catching boundary] ⭐ NEW
│   ├── KPIModal.tsx                   [KPI details modal]
│   └── ...
│
├── /context
│   └── AuthContext.tsx                [Authentication context]
│
├── /hooks
│   └── useAuth.ts                     [Authentication hook]
│
├── /pages
│   ├── AdminDashboard.tsx             [Admin dashboard page]
│   ├── AuditLog.tsx                   [Audit log viewer]
│   ├── Dashboard.tsx                  [User dashboard]
│   ├── KPITracker.tsx                 [Main KPI tracker] ⭐ MAJOR CHANGES
│   ├── LoginPage.tsx                  [Login page]
│   └── RegisterPage.tsx               [Registration page]
│
├── /services
│   ├── auditService.ts                [Audit logging service]
│   ├── kpiService.ts                  [KPI Firestore operations]
│   ├── permissionsService.ts          [Permission management]
│   └── taskService.ts                 [Task management]
│
├── /types
│   ├── index.ts                       [Main type definitions]
│   └── permissions.ts                 [Permission types]
│
├── /utils
│   ├── importKPIs.ts                  [KPI import utility]
│   └── logger.ts                      [Logging utility] ⭐ NEW
│
├── App.tsx                            [Root component] ⭐ MODIFIED
├── firebase.ts                        [Firebase config] ⭐ MODIFIED
└── main.tsx                           [App entry point]

/root
├── CHANGELOG.md                       [Detailed changelog] ⭐ NEW
├── WIKI.md                           [Technical wiki] ⭐ NEW
├── README.md                         [Project overview]
├── package.json                      [Dependencies]
├── tsconfig.json                     [TypeScript config]
├── vite.config.ts                    [Vite config]
└── tailwind.config.js                [Tailwind config]
```

---

## Common Patterns

### Pattern 1: Service Integration

**Location**: `/src/services/*.ts`

```typescript
import { logger } from '../utils/logger'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export const kpiService = {
  async createKPI(data: KPI) {
    try {
      logger.log('Creating KPI:', data)
      const docRef = await addDoc(collection(db, 'kpis'), data)
      logger.log('KPI created:', docRef.id)
      return docRef.id
    } catch (error) {
      logger.error('Failed to create KPI:', error)
      throw error
    }
  },

  // ... more methods
}
```

### Pattern 2: Component Error Handling

```typescript
import { logger } from '../utils/logger'

function MyComponent() {
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    try {
      setError(null)
      await someAsyncOperation()
      logger.log('Operation successful')
    } catch (error) {
      logger.error('Operation failed:', error)
      setError(error.message)
    }
  }

  return (
    <div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button onClick={handleAction}>Do Something</button>
    </div>
  )
}
```

### Pattern 3: Firestore Real-Time Listener

```typescript
import { onSnapshot, collection } from 'firebase/firestore'
import { logger } from '../utils/logger'

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'kpis'),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      logger.log('KPIs updated:', data.length)
      setKPIs(data)
    },
    (error) => {
      logger.error('Firestore listener error:', error)
    }
  )

  return () => unsubscribe() // Cleanup
}, [])
```

### Pattern 4: Conditional Rendering with Loading States

```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )
}

if (!user) {
  return <Navigate to="/login" />
}

return <YourComponent />
```

---

## Troubleshooting Guide

### Issue: "Cannot access uninitialized variable"

**Symptoms**: Variable used before initialization error
**Common Cause**: Hot reload cache issue
**Solution**:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Restart dev server
3. Clear browser cache
4. Check variable is defined before usage

```typescript
// Ensure variable is defined BEFORE use
const isAdmin = user?.email === 'hussein.srour@thakralone.com' // Line 62

// Used in useEffect that depends on it
useEffect(() => {
  if (!isAdmin) return
  // ...
}, [isAdmin]) // Line 257+
```

---

### Issue: "Firebase: Error (auth/network-request-failed)"

**Symptoms**: Cannot connect to Firebase
**Possible Causes**:
1. Incorrect environment variables
2. Network connectivity issues
3. Firebase project not configured
4. CORS issues

**Solution**:
```bash
# Check environment variables
cat .env.local

# Verify Firebase config
# Navigate to Firebase Console → Project Settings → General
# Ensure all values match

# Test Firebase connection
import { getAuth } from 'firebase/auth'
const auth = getAuth()
console.log(auth.app.options) // Should show your config
```

---

### Issue: "Firestore permission denied"

**Symptoms**: `FirebaseError: Missing or insufficient permissions`
**Cause**: Firestore security rules restrict access
**Solution**:

**Development Rules** (Firebase Console → Firestore Database → Rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Production Rules** (More restrictive):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kpis/{kpiId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.auth.token.email == 'hussein.srour@thakralone.com';
    }

    match /columnPermissions/{permId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.auth.token.email == 'hussein.srour@thakralone.com';
    }
  }
}
```

---

### Issue: "Module not found: Can't resolve '../utils/logger'"

**Symptoms**: Import error for logger
**Cause**: Logger not created or incorrect path
**Solution**:
```bash
# Verify logger exists
ls src/utils/logger.ts

# If missing, create it
# Copy from CHANGELOG.md implementation section

# Check import path is correct
import { logger } from '../utils/logger'  // From /src/pages
import { logger } from './logger'         // From /src/utils
```

---

### Issue: Production build shows console logs

**Symptoms**: Logs visible in production
**Cause**: Not using logger utility
**Solution**:
```typescript
// Find all console.* usage
grep -r "console\." src/

// Replace with logger
import { logger } from '../utils/logger'
logger.log('message') // Instead of console.log
```

---

### Issue: Error Boundary not catching errors

**Symptoms**: App still crashes
**Possible Causes**:
1. Error in Error Boundary itself
2. Error in event handler (not caught)
3. Async error (not caught)
4. Error outside React tree

**Solution**:
```typescript
// Event handlers need try-catch
const handleClick = async () => {
  try {
    await operation()
  } catch (error) {
    logger.error('Error:', error)
  }
}

// Async operations need .catch()
fetchData()
  .then(data => setData(data))
  .catch(error => logger.error('Fetch error:', error))
```

---

### Issue: TypeScript errors in production build

**Symptoms**: `npm run build` fails with TS errors
**Common Errors**:
- Unused variables
- Unused imports
- Type mismatches

**Solution**:
```bash
# Check TypeScript errors
npm run build

# Fix unused imports
- import { X, Y, Z } from 'lib'
+ import { X, Y } from 'lib'  // Remove unused Z

# Fix unused variables in loops
- for (const [key, value] of map) {
+ for (const [, value] of map) {  // Use _ for unused

# Fix type errors
const value: string = getData()  // Add proper types
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd MWCI_tracker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

### Development Commands

```bash
# Start dev server (with HMR)
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build
rm -rf dist && npm run build
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

### Code Quality Checks

```bash
# ESLint (if configured)
npm run lint

# Prettier (if configured)
npm run format

# TypeScript type checking
npx tsc --noEmit
```

### Debugging Tips

1. **Use Logger Extensively**
   ```typescript
   logger.group('Debug Session')
   logger.log('State:', state)
   logger.log('Props:', props)
   logger.log('Computed:', computed)
   logger.groupEnd()
   ```

2. **React DevTools**
   - Install React DevTools browser extension
   - Inspect component hierarchy
   - Check props and state
   - Profile performance

3. **Firebase Console**
   - Monitor Firestore reads/writes
   - Check authentication users
   - View security rule evaluations
   - Check Firebase Functions logs

4. **Network Tab**
   - Monitor Firebase API calls
   - Check request/response payloads
   - Identify slow requests
   - Debug CORS issues

### Testing Strategy

1. **Manual Testing Checklist**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Register new user
   - [ ] View KPIs as regular user
   - [ ] Edit KPIs as regular user
   - [ ] Admin dashboard access
   - [ ] Column permissions management
   - [ ] KPI import functionality
   - [ ] Duplicate cleanup
   - [ ] Audit log viewing
   - [ ] Error boundary triggers

2. **Production Readiness**
   - [ ] Zero console logs in production build
   - [ ] All TypeScript errors resolved
   - [ ] Firebase security rules configured
   - [ ] Environment variables set
   - [ ] Error tracking configured (optional)
   - [ ] Performance monitoring (optional)

---

## Performance Optimization

### Current Bundle Size
- **Total**: 1,303.62 kB
- **Gzipped**: 343.75 kB

### Optimization Opportunities

1. **Code Splitting**
   ```typescript
   // Lazy load admin routes
   const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
   const AuditLog = lazy(() => import('./pages/AuditLog'))

   <Suspense fallback={<LoadingSpinner />}>
     <AdminDashboard />
   </Suspense>
   ```

2. **Tree Shaking**
   ```typescript
   // Use named imports
   import { Button, Input } from 'components'

   // Instead of default imports
   import * as Components from 'components' // ❌ Imports everything
   ```

3. **Memoization**
   ```typescript
   // Expensive computations
   const sortedKPIs = useMemo(() => {
     return kpis.sort((a, b) => a.name.localeCompare(b.name))
   }, [kpis])

   // Callback optimization
   const handleSave = useCallback(async (data) => {
     await kpiService.save(data)
   }, [])
   ```

4. **Virtual Scrolling**
   - Implement for large KPI lists
   - Use libraries like `react-window` or `react-virtual`

---

## Security Best Practices

### Authentication
- ✅ Firebase Authentication with email validation
- ✅ Role-based access control (admin vs regular users)
- ✅ Protected routes with PrivateRoute component
- ⚠️ TODO: Implement password strength requirements
- ⚠️ TODO: Add email verification

### Firestore Security
- ✅ Authentication required for all reads
- ⚠️ TODO: Implement granular write permissions
- ⚠️ TODO: Add field-level security rules

### Environment Variables
- ✅ All secrets in environment variables
- ✅ Not committed to git (.env.local in .gitignore)
- ⚠️ TODO: Use Firebase App Check for API protection

### XSS Protection
- ✅ React automatically escapes values
- ✅ No dangerouslySetInnerHTML usage
- ✅ Tailwind CSS classes (no inline styles)

---

## Deployment Guide

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables in Vercel**:
1. Go to Project Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy

### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

**Build Settings**:
- Build command: `npm run build`
- Publish directory: `dist`

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## Future Claude Sessions: Quick Start

If you're a future Claude session picking up this project:

1. **Read This First**: `CHANGELOG.md` for what changed
2. **Architecture**: This `WIKI.md` for how it works
3. **Current Issues**: Check GitHub Issues
4. **Environment**: Verify `.env.local` exists
5. **Dependencies**: Run `npm install`
6. **Start Dev**: Run `npm run dev`
7. **Key Files**:
   - `/src/utils/logger.ts` - Logging system
   - `/src/components/ErrorBoundary.tsx` - Error handling
   - `/src/pages/KPITracker.tsx` - Main functionality (lines 257-345, 398-407)
   - `/src/firebase.ts` - Firebase config

8. **Testing**: Access `http://localhost:5173`
9. **Admin**: Login with `hussein.srour@thakralone.com`

---

**End of Wiki**
