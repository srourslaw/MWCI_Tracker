# MWCI Tracker - Troubleshooting Guide

## 🔍 Quick Diagnostic Checklist

Before diving into specific issues, run this quick diagnostic:

```bash
# 1. Check Node and npm versions
node --version    # Should be >= 18.x
npm --version     # Should be >= 9.x

# 2. Verify environment variables
cat .env.local    # Should have all VITE_FIREBASE_* variables

# 3. Check if dev server is running
ps aux | grep vite

# 4. Verify Firebase connection
curl -I https://firestore.googleapis.com

# 5. Check TypeScript compilation
npx tsc --noEmit

# 6. Verify dependencies installed
ls node_modules | wc -l  # Should show 1000+ packages
```

---

## 🔥 Common Issues

### Issue 1: "Cannot access uninitialized variable"

**Full Error**:
```
ReferenceError: Cannot access 'variableName' before initialization
```

**Symptoms**:
- Error appears in console
- Component fails to render
- Happens after hot reload

**Root Cause**:
- Variable used before declaration
- Hot Module Replacement (HMR) cache issue
- Stale browser cache

**Solutions**:

1. **Hard Refresh Browser**
   ```bash
   # Mac: Cmd + Shift + R
   # Windows/Linux: Ctrl + Shift + F5
   ```

2. **Restart Dev Server**
   ```bash
   # Kill server
   pkill -f vite

   # Restart
   npm run dev
   ```

3. **Clear Vite Cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

4. **Check Variable Order**
   ```typescript
   // ❌ WRONG - usage before declaration
   useEffect(() => {
     if (isAdmin) { ... }
   }, [])
   const isAdmin = user?.email === 'admin@example.com'

   // ✅ CORRECT - declaration before usage
   const isAdmin = user?.email === 'admin@example.com'
   useEffect(() => {
     if (isAdmin) { ... }
   }, [isAdmin])
   ```

**Location in Code**: `/src/pages/KPITracker.tsx:62`

---

### Issue 2: Firebase Connection Errors

#### 2A: "Firebase: Error (auth/network-request-failed)"

**Full Error**:
```
FirebaseError: Firebase: Error (auth/network-request-failed)
```

**Symptoms**:
- Cannot login or register
- Firebase authentication fails
- Network tab shows failed requests to Firebase

**Root Causes**:
- Incorrect Firebase configuration
- Network connectivity issues
- Firewall blocking Firebase domains
- CORS configuration issues

**Solutions**:

1. **Verify Environment Variables**
   ```bash
   # Check all Firebase variables exist
   grep VITE_FIREBASE .env.local

   # Should show:
   # VITE_FIREBASE_API_KEY=...
   # VITE_FIREBASE_AUTH_DOMAIN=...
   # VITE_FIREBASE_PROJECT_ID=...
   # VITE_FIREBASE_STORAGE_BUCKET=...
   # VITE_FIREBASE_MESSAGING_SENDER_ID=...
   # VITE_FIREBASE_APP_ID=...
   ```

2. **Verify Firebase Configuration**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings → General
   - Compare all values with `.env.local`

3. **Test Network Connectivity**
   ```bash
   # Test Firebase API
   curl -I https://identitytoolkit.googleapis.com
   curl -I https://firestore.googleapis.com

   # Should return 200 OK or 404 (means reachable)
   ```

4. **Check CORS Settings**
   - Firebase automatically handles CORS
   - If using custom domain, add it to Firebase authorized domains
   - Firebase Console → Authentication → Settings → Authorized domains

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

**Reference**: `/src/firebase.ts`

---

#### 2B: "FirebaseError: Missing or insufficient permissions"

**Full Error**:
```
FirebaseError: Missing or insufficient permissions
```

**Symptoms**:
- Can login but cannot read/write data
- Firestore operations fail
- Specific collections inaccessible

**Root Cause**:
Firestore security rules are too restrictive

**Solutions**:

1. **Check Firestore Rules** (Firebase Console → Firestore Database → Rules)

   **Development Rules** (Permissive):
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

2. **Production Rules** (More Secure):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // KPIs collection
       match /kpis/{kpiId} {
         // Anyone authenticated can read
         allow read: if request.auth != null;

         // Only admin can write
         allow write: if request.auth != null &&
           request.auth.token.email == 'hussein.srour@thakralone.com';
       }

       // Column permissions
       match /columnPermissions/{permId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null &&
           request.auth.token.email == 'hussein.srour@thakralone.com';
       }

       // Audit logs
       match /auditLogs/{logId} {
         allow read: if request.auth != null &&
           request.auth.token.email == 'hussein.srour@thakralone.com';
         allow create: if request.auth != null;
         allow update, delete: if false; // Never allow modification
       }
     }
   }
   ```

3. **Test Rules with Firestore Emulator**
   ```bash
   # Install Firebase tools
   npm install -g firebase-tools

   # Start emulator
   firebase emulators:start --only firestore

   # Update firebaseConfig in firebase.ts to use emulator
   ```

4. **Check Authentication State**
   ```typescript
   import { auth } from './firebase'

   auth.onAuthStateChanged((user) => {
     if (user) {
       console.log('User authenticated:', user.email)
     } else {
       console.log('User not authenticated')
     }
   })
   ```

**Reference**: `/src/services/kpiService.ts`

---

### Issue 3: TypeScript Compilation Errors

#### 3A: "Module not found: Can't resolve '../utils/logger'"

**Full Error**:
```
Module not found: Can't resolve '../utils/logger'
```

**Symptoms**:
- Build fails
- Import error in console
- Red squiggly lines in IDE

**Root Cause**:
Logger utility not created or incorrect path

**Solutions**:

1. **Verify Logger Exists**
   ```bash
   ls -la src/utils/logger.ts

   # If not found, create it
   ```

2. **Create Logger** (`/src/utils/logger.ts`):
   ```typescript
   const isDevelopment = import.meta.env.DEV

   export const logger = {
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
     error: (...args: any[]) => {
       console.error(...args)
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

3. **Fix Import Path**
   ```typescript
   // From pages directory
   import { logger } from '../utils/logger'

   // From components directory
   import { logger } from '../utils/logger'

   // From services directory
   import { logger } from '../utils/logger'

   // From utils directory
   import { logger } from './logger'
   ```

---

#### 3B: "Property 'X' is declared but never read"

**Full Error**:
```
src/components/ColumnPermissionsManager.tsx(3,27): error TS6133: 'Plus' is declared but its value is never read.
```

**Symptoms**:
- Build fails with `npm run build`
- Works fine in dev mode
- TypeScript strict mode error

**Root Cause**:
Unused imports or variables in production build

**Solutions**:

1. **Remove Unused Imports**
   ```typescript
   // ❌ BEFORE
   import { Shield, Save, X, Plus } from 'lucide-react'
   // Only using Shield, Save, X

   // ✅ AFTER
   import { Shield, Save, X } from 'lucide-react'
   ```

2. **Remove Unused Variables**
   ```typescript
   // ❌ BEFORE
   for (const [key, value] of map.entries()) {
     console.log(value) // key is unused
   }

   // ✅ AFTER
   for (const [, value] of map.entries()) {
     console.log(value)
   }
   ```

3. **Find All Unused Imports/Variables**
   ```bash
   # Build to see all errors
   npm run build

   # Or use TypeScript directly
   npx tsc --noEmit
   ```

**Reference**:
- `/src/components/ColumnPermissionsManager.tsx:3`
- `/src/components/ErrorBoundary.tsx:1`
- `/src/pages/KPITracker.tsx:302`

---

### Issue 4: Production Build Issues

#### 4A: Console Logs Visible in Production

**Symptoms**:
- Console logs appear in production build
- Logger not working as expected
- `import.meta.env.PROD` not true

**Root Cause**:
Not using logger utility or incorrect build

**Solutions**:

1. **Find All console.* Usage**
   ```bash
   # Search entire codebase
   grep -r "console\." src/

   # Should only find console.warn in firebase.ts persistence errors
   ```

2. **Replace with Logger**
   ```typescript
   // ❌ BEFORE
   console.log('User data:', user)
   console.warn('Deprecated method')
   console.error('Error:', error)

   // ✅ AFTER
   import { logger } from '../utils/logger'

   logger.log('User data:', user)      // Dev only
   logger.warn('Deprecated method')    // Dev only
   logger.error('Error:', error)       // Always visible
   ```

3. **Verify Production Build**
   ```bash
   # Build for production
   npm run build

   # Preview production build
   npm run preview

   # Open http://localhost:4173
   # Open browser console - should be silent
   ```

4. **Check Environment Detection**
   ```typescript
   // In any component
   console.log('Environment:', {
     DEV: import.meta.env.DEV,
     PROD: import.meta.env.PROD,
     MODE: import.meta.env.MODE
   })

   // Development: { DEV: true, PROD: false, MODE: 'development' }
   // Production:  { DEV: false, PROD: true, MODE: 'production' }
   ```

**Reference**: `/src/utils/logger.ts`

---

#### 4B: "Unterminated JSX contents"

**Full Error**:
```
Internal server error: /src/App.tsx: Unterminated JSX contents. (82:13)
```

**Symptoms**:
- Build fails
- Dev server shows error overlay
- JSX syntax error

**Root Cause**:
Improper JSX closing tags or nesting

**Solutions**:

1. **Check JSX Structure**
   ```typescript
   // ❌ WRONG - Missing closing tag
   <ErrorBoundary>
     <Router>
       <AuthProvider>
         <Routes>...</Routes>
       </AuthProvider>
     </Router>
   // Missing </ErrorBoundary>

   // ✅ CORRECT
   <ErrorBoundary>
     <Router>
       <AuthProvider>
         <Routes>...</Routes>
       </AuthProvider>
     </Router>
   </ErrorBoundary>
   ```

2. **Use IDE Auto-Format**
   ```bash
   # VS Code: Shift + Alt + F
   # Or install Prettier extension
   ```

3. **Validate JSX Balance**
   - Every opening tag must have closing tag
   - Self-closing tags end with `/>` not `>`
   - Fragment shorthand: `<>...</>` or `<React.Fragment>...</React.Fragment>`

**Reference**: `/src/App.tsx:82`

---

### Issue 5: Duplicate KPIs

#### 5A: Multiple Duplicates in Firestore

**Symptoms**:
- Firestore shows 300+ KPI records
- Only 46 unique KPIs should exist
- Same KPI appears multiple times

**Root Cause**:
Multiple imports without cleanup

**Solutions**:

1. **Automatic Cleanup** (Already Implemented)
   - Auto-cleanup runs on every app load for admin users
   - Located in `/src/pages/KPITracker.tsx` lines 257-345
   - Keeps most recent duplicate based on `updatedAt`
   - Deletes all older duplicates

2. **Manual Cleanup** (If auto-cleanup fails)
   ```typescript
   // In KPITracker component, uncomment manual cleanup
   // Or use Firestore Console to delete manually
   ```

3. **Prevent Future Duplicates**
   ```typescript
   // Before importing, check if KPI exists
   const existingKPI = await kpiService.findByNameAndCategory(
     kpi.name,
     kpi.category
   )

   if (existingKPI) {
     await kpiService.update(existingKPI.id, kpi)
   } else {
     await kpiService.create(kpi)
   }
   ```

4. **Monitor Firestore**
   - Firebase Console → Firestore Database
   - Count documents in `kpis` collection
   - Should be ~46 documents after cleanup

**Cleanup Log Example**:
```
🧹 Auto-cleaning 274 duplicates detected in Firestore...
Deleting duplicate: ESG Report: Environment (abc123)
Deleting duplicate: ESG Report: Social (def456)
...
✅ Auto-cleanup iteration complete! Deleted 274 duplicates
✨ No duplicates found - database is clean!
```

**Reference**: `/src/pages/KPITracker.tsx:257-345`

---

#### 5B: Duplicate Warnings in Console

**Symptoms**:
```
⚠️ Duplicate KPI ID detected and filtered: FvA1EonzqcaqfgHIQKln - ESG Report: Environment
```

**Root Cause**:
Multiple entries in `initialKPIs.ts` mapping to same Firestore ID

**Impact**:
- No impact on functionality
- Client-side filter removes duplicates before rendering
- User never sees duplicates

**Solutions**:

1. **Already Fixed** (Silent Filtering)
   - Warning log removed in KPITracker.tsx line 402
   - Duplicates silently filtered
   - No user-visible impact

2. **Fix Root Cause** (Optional, for perfection)
   - Edit `/src/data/initialKPIs.ts`
   - Remove duplicate entries with same name + category
   - This is cosmetic - app works perfectly with silent filtering

**Reference**: `/src/pages/KPITracker.tsx:398-407`

---

### Issue 6: Error Boundary Not Working

#### 6A: App Still Crashes on Errors

**Symptoms**:
- Component error crashes entire app
- White screen of death
- No error boundary fallback UI shown

**Root Cause**:
Error not caught by Error Boundary

**Why Error Boundaries Don't Catch Some Errors**:
- Event handler errors (need try-catch)
- Asynchronous code (promises, setTimeout)
- Server-side rendering errors
- Errors in Error Boundary itself

**Solutions**:

1. **Event Handler Pattern**
   ```typescript
   // ❌ NOT CAUGHT by Error Boundary
   const handleClick = async () => {
     await riskyOperation() // If this throws, not caught
   }

   // ✅ CAUGHT with try-catch
   const handleClick = async () => {
     try {
       await riskyOperation()
     } catch (error) {
       logger.error('Operation failed:', error)
       setError(error.message)
     }
   }
   ```

2. **Promise Pattern**
   ```typescript
   // ❌ NOT CAUGHT
   fetchData().then(data => setData(data))

   // ✅ CAUGHT
   fetchData()
     .then(data => setData(data))
     .catch(error => {
       logger.error('Fetch error:', error)
       setError(error.message)
     })
   ```

3. **Async Effect Pattern**
   ```typescript
   useEffect(() => {
     const loadData = async () => {
       try {
         const data = await fetchData()
         setData(data)
       } catch (error) {
         logger.error('Load error:', error)
         setError(error.message)
       }
     }

     loadData()
   }, [])
   ```

4. **Verify Error Boundary Wrapping**
   ```typescript
   // App.tsx - Must wrap entire app
   <ErrorBoundary>
     <Router>
       <AuthProvider>
         <Routes>...</Routes>
       </AuthProvider>
     </Router>
   </ErrorBoundary>
   ```

**Reference**: `/src/components/ErrorBoundary.tsx`

---

#### 6B: Error Details Not Showing in Development

**Symptoms**:
- Error boundary shows but no error details
- Stack trace missing

**Root Cause**:
`import.meta.env.DEV` is false or error info not captured

**Solutions**:

1. **Check Environment**
   ```typescript
   console.log('DEV:', import.meta.env.DEV)
   // Should be true in development
   ```

2. **Verify Error Info Capture**
   ```typescript
   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     logger.error('ErrorBoundary caught an error:', error, errorInfo)

     this.setState({
       error,
       errorInfo, // Make sure this is set
     })
   }
   ```

3. **Check Render Logic**
   ```typescript
   {import.meta.env.DEV && this.state.error && (
     <div className="error-details">
       <pre>{this.state.error.toString()}</pre>
       {this.state.errorInfo && (
         <pre>{this.state.errorInfo.componentStack}</pre>
       )}
     </div>
   )}
   ```

**Reference**: `/src/components/ErrorBoundary.tsx:92-106`

---

### Issue 7: React Router Warnings

**Symptoms**:
```
React Router Future Flag Warning: React Router will begin wrapping state updates in React.startTransition in v7
```

**Root Cause**:
Missing React Router v7 future flags

**Solution**:

Already fixed in `/src/App.tsx`:
```typescript
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

If warning persists:
1. Update React Router: `npm install react-router-dom@latest`
2. Clear cache: `rm -rf node_modules/.vite`
3. Restart dev server: `npm run dev`

**Reference**: `/src/App.tsx:38-41`

---

### Issue 8: Firebase Persistence Warnings

**Symptoms**:
```
Firestore persistence failed: Multiple tabs open
```

**Explanation**:
This is EXPECTED behavior, not an error. Firebase offline persistence can only be enabled in one browser tab at a time.

**Impact**:
- No functional impact
- Other tabs still work, just without offline caching
- Only one tab benefits from offline persistence

**To Suppress Warning** (Optional):
```typescript
// In firebase.ts
enableIndexedDbPersistence(db).catch((err) => {
  // Silent - don't log at all
})
```

**Reference**: `/src/firebase.ts:36-44`

---

## 🛠️ Development Tools

### Useful Browser Extensions

1. **React Developer Tools**
   - Inspect component hierarchy
   - View props and state
   - Profile performance

2. **Redux DevTools** (if using Redux)
   - Not currently used, but helpful for complex state

3. **Firebase Auth Emulator**
   - Test authentication locally
   - No quota limits

### VS Code Extensions

1. **ESLint** - Linting
2. **Prettier** - Code formatting
3. **TypeScript Hero** - Import management
4. **Error Lens** - Inline error highlighting
5. **Tailwind CSS IntelliSense** - Tailwind class autocomplete

### Debugging Commands

```bash
# View all console logs in terminal
npm run dev 2>&1 | grep -E "(log|warn|error)"

# Monitor Firestore operations
# Firebase Console → Firestore → Usage tab

# Check build size
npm run build
du -sh dist/

# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Check for security vulnerabilities
npm audit

# Fix auto-fixable issues
npm audit fix
```

---

## 📊 Performance Debugging

### Slow Page Load

1. **Check Network Tab**
   - Large bundle size? Consider code splitting
   - Slow Firebase requests? Check Firestore indexes
   - Large images? Optimize and compress

2. **React DevTools Profiler**
   - Record interaction
   - Identify slow components
   - Look for unnecessary re-renders

3. **Lighthouse Audit**
   - Chrome DevTools → Lighthouse
   - Run audit
   - Follow recommendations

### Memory Leaks

**Symptoms**:
- Page becomes slow over time
- Memory usage increases continuously

**Common Causes**:
1. **Firestore Listeners Not Cleaned Up**
   ```typescript
   // ❌ MEMORY LEAK
   useEffect(() => {
     onSnapshot(collection(db, 'kpis'), (snapshot) => {
       setKPIs(snapshot.docs.map(doc => doc.data()))
     })
   }, [])

   // ✅ PROPER CLEANUP
   useEffect(() => {
     const unsubscribe = onSnapshot(
       collection(db, 'kpis'),
       (snapshot) => setKPIs(snapshot.docs.map(doc => doc.data()))
     )
     return () => unsubscribe() // Cleanup!
   }, [])
   ```

2. **Event Listeners Not Removed**
   ```typescript
   useEffect(() => {
     const handleResize = () => { ... }
     window.addEventListener('resize', handleResize)
     return () => window.removeEventListener('resize', handleResize)
   }, [])
   ```

3. **Timers Not Cleared**
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => { ... }, 1000)
     return () => clearTimeout(timer)
   }, [])
   ```

---

## 🔐 Security Issues

### Exposed API Keys

**Q**: Is it safe to expose Firebase API keys in client-side code?

**A**: YES, Firebase API keys are safe to expose. They're not secret keys - they identify your Firebase project, not authorize access. Security is enforced through Firestore Security Rules.

**However**:
- Always use environment variables (`.env.local`)
- Never commit `.env.local` to git
- Use Firebase Security Rules to protect data
- Enable Firebase App Check for additional protection

### XSS Vulnerabilities

**Prevention**:
- ✅ React automatically escapes values
- ✅ Never use `dangerouslySetInnerHTML` with user input
- ✅ Sanitize user input before storing in Firestore
- ✅ Use Tailwind classes instead of inline styles

**Example**:
```typescript
// ✅ SAFE - React escapes automatically
<div>{user.name}</div>

// ⚠️ DANGEROUS - Can inject HTML
<div dangerouslySetInnerHTML={{ __html: user.name }} />

// ✅ SAFE - Sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.name) }} />
```

---

## 📞 Getting Help

### Self-Help Resources

1. **Documentation**
   - `CHANGELOG.md` - What changed
   - `WIKI.md` - How it works
   - `TROUBLESHOOTING.md` - This file
   - `README.md` - Project overview

2. **Code Comments**
   - Read inline comments in complex files
   - Pay attention to TypeScript types

3. **Git History**
   ```bash
   # See recent changes
   git log --oneline -10

   # See changes to specific file
   git log -p src/pages/KPITracker.tsx
   ```

### External Resources

1. **React Documentation**: https://react.dev
2. **TypeScript Handbook**: https://www.typescriptlang.org/docs
3. **Firebase Documentation**: https://firebase.google.com/docs
4. **Vite Documentation**: https://vitejs.dev
5. **Tailwind CSS**: https://tailwindcss.com/docs
6. **Framer Motion**: https://www.framer.com/motion

### Community Support

1. **Stack Overflow**: Tag questions with `reactjs`, `typescript`, `firebase`
2. **Reddit**: r/reactjs, r/typescript, r/firebase
3. **Discord**: Reactiflux, Firebase Discord

---

## ✅ Health Check Script

Create this file for quick diagnostics:

**`scripts/health-check.sh`**:
```bash
#!/bin/bash

echo "🏥 MWCI Tracker Health Check"
echo "=============================="

# Node version
echo -n "Node version: "
node --version

# npm version
echo -n "npm version: "
npm --version

# Environment variables
echo -e "\n📋 Environment Variables:"
if [ -f .env.local ]; then
  echo "✅ .env.local exists"
  grep -c "VITE_FIREBASE" .env.local | xargs echo "  Firebase variables:"
else
  echo "❌ .env.local not found"
fi

# Dependencies
echo -e "\n📦 Dependencies:"
if [ -d node_modules ]; then
  echo "✅ node_modules exists"
  ls node_modules | wc -l | xargs echo "  Packages installed:"
else
  echo "❌ node_modules not found - run: npm install"
fi

# TypeScript check
echo -e "\n🔍 TypeScript:"
npx tsc --noEmit && echo "✅ No TypeScript errors" || echo "❌ TypeScript errors found"

# Build check
echo -e "\n🏗️  Build:"
npm run build && echo "✅ Build successful" || echo "❌ Build failed"

echo -e "\n=============================="
echo "Health check complete!"
```

Run with: `bash scripts/health-check.sh`

---

**End of Troubleshooting Guide**

For issues not covered here, check:
- `WIKI.md` for architecture details
- `CHANGELOG.md` for recent changes
- GitHub Issues for known problems
