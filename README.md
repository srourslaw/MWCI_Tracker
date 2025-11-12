# MWCI Tracker - Project Management Dashboard

A comprehensive project management system built with React, TypeScript, Firebase, and Tailwind CSS for tracking KPIs, deliverables, tasks, and team collaboration.

## Table of Contents

- [Features](#features)
- [Environments](#environments)
- [Getting Started](#getting-started)
- [Login Credentials](#login-credentials)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Available Pages](#available-pages)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)

---

## Features

- **KPI Tracking**: Monitor project KPIs with real-time updates and analytics
- **Deliverables Tracker**: Detailed workflow tracking for all project deliverables with 14 stages
- **Task Management**: Create, assign, and track tasks across team members
- **User Authentication**: Secure login with email verification and 2FA support
- **Role-Based Access Control**: Admin and regular user permissions
- **Real-time Updates**: Firestore real-time synchronization
- **Audit Trail**: Track all changes with detailed audit logs
- **Team Directory**: Manage team members and permissions
- **Beautiful UI**: Modern design with Framer Motion animations

---

## Environments

### Development Environment (localhost)

Multiple development servers may be running on different ports:

- **Primary Dev Server**: `http://localhost:5173`
- **Secondary Dev Server**: `http://localhost:5174` (if port 5173 is busy)
- **Additional Servers**: `http://localhost:5175`, `5176`, etc.
- **Preview Server**: `http://localhost:4173`

**How to identify which server is running:**
1. Check the terminal output when you start the dev server
2. Look for the line: `➜  Local:   http://localhost:XXXX/`
3. Use that URL in your browser

**Example Terminal Output:**
```
VITE v5.4.21  ready in 244 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Production Environment

**Firebase Hosting URL**: Will be provided after deployment
- Deployed using: `npm run build` and `firebase deploy`
- Uses production Firebase config

### Backend (Firestore)

- **Development Database**: `mwci-tracker` (Firestore)
- **Production Database**: Same database, different security rules can be applied
- **Firebase Console**: https://console.firebase.google.com/project/mwci-tracker

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Navigate to project directory**
   ```bash
   cd /Users/husseinsrour/Downloads/MWCI_tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Ensure `src/firebase.ts` has the correct Firebase config
   - Firebase project: `mwci-tracker`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to the URL shown in terminal (usually `http://localhost:5173`)
   - If you see a blank page, try a different port or check console for errors

### Build for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview

# Deploy to Firebase (Admin only)
firebase deploy
```

---

## Login Credentials

### Admin Account

**Email**: `hussein.srour@thakralone.com`
**Password**: *Your admin password*

**Permissions**: Full access to all features including:
- User approval/rejection
- KPI data import
- Audit log viewing
- Column permissions management
- Deliverables import
- System administration

### Test User Accounts

#### @thakralone.com Domain (Auto-approved after email verification)

**Example**: `yourname@thakralone.com`
**Auto-approved**: ✅ Yes (after email verification)
**Access**: Full dashboard access immediately after email verification

#### @manilawater.com Domain (Requires admin approval)

**Example**: `yourname@manilawater.com`
**Auto-approved**: ❌ No
**Access**: Pending approval page until admin approves

### Creating New Accounts

1. Navigate to `/register`
2. Fill in the registration form:
   - Full name
   - Email (must be @thakralone.com or @manilawater.com)
   - Password (minimum requirements apply)
3. **Email domains**:
   - `@thakralone.com` - Auto-approved after email verification
   - `@manilawater.com` - Requires admin approval after email verification
   - Other domains - Automatically rejected
4. Check email for verification link
5. Click verification link (automatically redirects back to login)
6. Login with your credentials
7. If @manilawater.com, wait for admin approval

---

## User Roles

### Admin User

**Email**: `hussein.srour@thakralone.com`

**Access**:
- Admin Dashboard (`/admin`)
- KPI Tracker with import/export/analytics
- Deliverables Tracker with import
- Audit Log
- User Approval System
- Column Permissions Manager
- Team Directory
- All regular user features

### Regular User

**Access**:
- User Dashboard (`/dashboard`)
- KPI Tracker (view/edit based on permissions)
- Deliverables Tracker (view-only)
- Task Management
- 2FA Settings
- Profile Management

---

## Project Structure

```
MWCI_tracker/
├── src/
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx           # Login page
│   │   ├── RegisterPage.tsx        # Registration page
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   ├── KPITracker.tsx          # KPI tracking page
│   │   ├── DeliverablesTracker.tsx # Deliverables workflow tracking
│   │   ├── AuditLog.tsx            # Audit trail viewer
│   │   ├── TwoFactorPage.tsx       # 2FA verification
│   │   └── PendingApprovalPage.tsx # Pending approval/verification
│   ├── components/         # Reusable components
│   │   ├── TaskModal.tsx
│   │   ├── KPIModal.tsx
│   │   ├── EditableCell.tsx
│   │   ├── TwoFactorSettings.tsx
│   │   ├── UserApprovalDashboard.tsx
│   │   └── ...
│   ├── services/          # Firebase services
│   │   ├── taskService.ts
│   │   ├── kpiService.ts
│   │   ├── deliverableService.ts
│   │   ├── userService.ts
│   │   ├── auditService.ts
│   │   └── twoFactorService.ts
│   ├── types/             # TypeScript types
│   │   ├── task.ts
│   │   ├── kpi.ts
│   │   ├── deliverable.ts
│   │   └── user.ts
│   ├── utils/             # Utility functions
│   │   ├── importKPIs.ts
│   │   ├── importDeliverables.ts
│   │   └── logger.ts
│   ├── data/              # Static data
│   │   ├── initialKPIs.ts
│   │   └── teamMembers.ts
│   ├── context/           # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts
│   ├── firebase.ts        # Firebase configuration
│   └── App.tsx            # Main app component
├── functions/             # Firebase Cloud Functions
│   └── src/
│       ├── index.ts       # Functions entry point
│       └── ...
├── docs/                  # Documentation
│   └── EMAIL_VERIFICATION.md
├── public/                # Static assets
├── package.json
└── README.md             # This file
```

---

## Available Pages

### Public Pages (No Login Required)

- **`/login`** - Login page
- **`/register`** - User registration
- **`/verify-2fa`** - Two-factor authentication verification

### Protected Pages (Login Required)

#### Regular Users

- **`/dashboard`** - Personal task dashboard
  - View/create/edit/delete personal tasks
  - Task statistics
  - 2FA settings
  - Email verification test helper

- **`/kpi-tracker`** - KPI monitoring and analytics
  - View all KPIs from Excel import
  - Edit KPIs based on column permissions
  - Filter by category, status, etc.
  - Analytics view with charts
  - Zoom controls for table view

- **`/deliverables-tracker`** - Detailed deliverables workflow tracking
  - View all deliverables (copied from KPI names)
  - Track 14 workflow stages per deliverable
  - Set target and actual dates
  - Add notes for each stage
  - Track UAT bugs
  - Filter by phase

#### Admin Only

- **`/admin`** - Admin dashboard with system overview
  - View all users and their tasks
  - Team statistics
  - User approval/rejection
  - Column permissions management
  - Team directory

- **`/audit-log`** - View all system changes and audit trail
  - See all KPI changes
  - Filter by date, user, field
  - Export audit data

### Special Pages

- **`/pending-approval`** - Shown when user needs email verification or admin approval
  - Email verification status
  - Resend verification email
  - Auto-checks for verification every 3 seconds

---

## Development Guide

### Running Development Server

```bash
# Start dev server (hot reload enabled)
npm run dev

# Server will start on available port:
# - http://localhost:5173 (default)
# - http://localhost:5174 (if 5173 is busy)
# - http://localhost:5175 (if 5174 is busy)
# - Check terminal for exact URL
```

**Output Example:**
```
> mwci-tracker@1.0.0 dev
> vite

Port 5173 is in use, trying another one...

  VITE v5.4.21  ready in 244 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

**Important**: Always check the terminal to see which port is being used!

### Multiple Dev Servers

You can run multiple instances simultaneously:

```bash
# Terminal 1
npm run dev
# Will use port 5173

# Terminal 2 (in another terminal window)
npm run dev
# Will use port 5174

# Terminal 3
npm run dev
# Will use port 5175
```

### Hot Module Replacement (HMR)

- Code changes automatically reflect in browser
- No need to manually refresh (most of the time)
- If you don't see changes:
  - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
  - Check terminal for errors
  - Clear browser cache

### Database Access

**Firestore Console**: https://console.firebase.google.com/project/mwci-tracker/firestore

**Collections**:
- `users` - User profiles and permissions
- `tasks` - Task management
- `kpis` - KPI data
- `deliverables` - Deliverables tracking
- `auditLogs` - Change history
- `columnPermissions` - User permissions
- `twoFactorCodes` - 2FA codes

### Firebase Functions

Located in `/functions` directory:

```bash
# Navigate to functions
cd functions

# Install dependencies
npm install

# Build functions
npm run build

# Deploy functions (admin only)
firebase deploy --only functions
```

**Available Functions**:
- `cleanupUnverifiedUsers` - Deletes unverified users after 7 days
- `send2FAEmail` - Sends 2FA codes via email

---

## Troubleshooting

### Can't See the Deliverables Button

**Problem**: The "Deliverables" button doesn't appear in the header next to "KPI Tracker"

**Solution**:
1. **Hard refresh** browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Check which port** you're on:
   - Look at terminal output
   - Verify you're on the correct `localhost:XXXX` URL
3. **Navigate to correct URL**:
   - If terminal shows `localhost:5174`, use that
   - Don't use old/cached URLs
4. **Clear browser cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
5. **Check browser console** (F12) for errors
6. **Try different browser** (Chrome, Firefox, Safari)

### Port Already in Use

**Problem**: "Port 5173 is in use"

**Solution**:

**Mac/Linux:**
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or just use the next available port (recommended)
# Vite will automatically try 5174, 5175, etc.
```

**Windows:**
```bash
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process by PID
taskkill /PID <PID> /F

# Or just use the next available port (recommended)
```

**Recommended**: Just let Vite use the next available port shown in terminal!

### Email Verification Not Working

**Problem**: Can't verify email / verification link not working

**Solution**:
1. **Check spam/junk folder**
2. **Wait 2-3 minutes** for email delivery
3. **Use "Resend Verification Email"** button on pending approval page
4. **Check Firebase Console**:
   - Go to Authentication → Users
   - Find your email
   - Check if `emailVerified` is true
5. **Check email address** is correct in registration
6. **See detailed documentation**: `docs/EMAIL_VERIFICATION.md`

### Login Issues

**Problem**: Can't login after registration

**Solution**:
1. **Verify email first** - Check inbox for verification link
2. **Wait for approval** if using @manilawater.com domain
3. **Check console** (F12) for error messages
4. **Clear cookies** and local storage:
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   sessionStorage.clear()
   ```
5. **Try password reset** if forgotten
6. **Contact admin** if account issues persist

### KPI Data Not Showing

**Problem**: KPI Tracker page is empty

**Solution**:
1. **Login as admin** (`hussein.srour@thakralone.com`)
2. **Click "Import Data" button** (top right of KPI Tracker)
3. **Wait for import** to complete (progress shown in alert)
4. **Refresh page** if needed
5. **Check Firestore console** to verify data exists in `kpis` collection

### Deliverables Page Empty

**Problem**: Deliverables Tracker shows "No deliverables found"

**Solution**:
1. **Login as admin**
2. **Navigate to Deliverables Tracker** (`/deliverables-tracker`)
3. **Click "Import from KPIs" button** (appears when no deliverables exist)
4. **Wait for import** to complete
5. **Refresh page**
6. **Select a deliverable** from left sidebar to view details

### Build Errors

**Problem**: `npm run build` fails with errors

**Solution**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf dist

# Rebuild
npm run build
```

### Firebase Authentication Errors

**Problem**: "Firebase: Error (auth/...)" messages

**Solution**:
1. **Check Firebase Console** → Authentication → Settings
2. **Verify email/password** is enabled as sign-in method
3. **Check Firebase config** in `src/firebase.ts`
4. **Ensure Firebase project** is active and not suspended
5. **Check Firebase quotas** (free tier limits)

### Page Shows "Loading..." Forever

**Problem**: Page stuck on loading spinner

**Solution**:
1. **Check network tab** (F12 → Network) for failed requests
2. **Check Firestore rules**:
   - Go to Firebase Console → Firestore → Rules
   - Ensure rules allow authenticated users to read/write
3. **Check authentication**:
   - Verify user is logged in
   - Check `localStorage` for auth token
4. **Check console** (F12) for errors
5. **Hard refresh** browser
6. **Clear cache and cookies**

---

## Common Workflows

### First Time Setup (Developer)

1. **Clone and install**:
   ```bash
   cd /Users/husseinsrour/Downloads/MWCI_tracker
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Open browser** to shown URL (e.g., `http://localhost:5173`)

4. **Login as admin**: `hussein.srour@thakralone.com`

5. **Import data**:
   - Go to KPI Tracker → Click "Import Data"
   - Go to Deliverables Tracker → Click "Import from KPIs"

6. **Test features**:
   - Create tasks on Dashboard
   - Edit KPIs
   - View analytics
   - Check audit log

### Adding a New User

1. **User registers** at `/register` with company email

2. **User verifies email**:
   - Check inbox
   - Click verification link
   - Auto-redirects to login

3. **Admin approves** (if @manilawater.com):
   - Login as admin
   - Go to Admin Dashboard
   - Find user in "Pending Approvals"
   - Click "Approve"

4. **User logs in** and accesses dashboard

### Deploying to Production

1. **Test locally**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Test on preview server**: `http://localhost:4173`

3. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

4. **Verify deployment**:
   - Check Firebase Console → Hosting
   - Test deployed URL
   - Verify all features work

---

## Environment Variables

Firebase config is currently in `src/firebase.ts`. If you need environment variables:

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=mwci-tracker
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint

# Firebase
firebase deploy              # Deploy everything
firebase deploy --only hosting    # Deploy hosting only
firebase deploy --only functions  # Deploy functions only
firebase emulators:start     # Start local Firebase emulators
```

---

## Support & Documentation

### Additional Documentation

- **Email Verification System**: [`docs/EMAIL_VERIFICATION.md`](docs/EMAIL_VERIFICATION.md)
- **2FA System**: [`functions/README.md`](functions/README.md)
- **Firebase Functions**: See `/functions` folder

### Getting Help

1. **Check browser console** (F12) for errors
2. **Check terminal** for build/server errors
3. **Review Firebase Console** logs
4. **Check this README** for troubleshooting
5. **Contact**: hussein.srour@thakralone.com

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase
  - Firestore (Database)
  - Authentication
  - Cloud Functions
  - Hosting
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Forms**: React Hook Form (where applicable)

---

## Security Features

- ✅ Email verification required
- ✅ Domain-based access control (@thakralone.com, @manilawater.com)
- ✅ Role-based permissions (Admin vs Regular users)
- ✅ 2FA support (optional)
- ✅ Firestore security rules
- ✅ Audit trail for all changes
- ✅ Column-level edit permissions
- ✅ Automatic cleanup of unverified users

---

## License

Internal project for MWCI - All rights reserved

---

## Last Updated

November 12, 2025

---

## Quick Reference

**Development Server**: `npm run dev` → Check terminal for port
**Admin Login**: `hussein.srour@thakralone.com`
**Firebase Console**: https://console.firebase.google.com/project/mwci-tracker
**Import KPIs**: Admin → KPI Tracker → "Import Data"
**Import Deliverables**: Admin → Deliverables Tracker → "Import from KPIs"
**Hard Refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
