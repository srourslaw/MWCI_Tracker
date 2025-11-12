# Firebase Cloud Functions - MWCI Tracker

## Overview

This directory contains Firebase Cloud Functions that automatically maintain data consistency between Firebase Authentication and Firestore.

## Functions

### 1. `cleanupUserData` (Automatic)

**Trigger**: Runs automatically when a user is deleted from Firebase Authentication

**What it does**:
- Deletes user profile from Firestore `users` collection
- Deletes all user's tasks from `tasks` collection
- Deletes user's 2FA codes from `twoFactorCodes` collection
- Deletes user's KPI entries from `kpis` collection
- Logs all deletions to Cloud Functions logs

**Benefits**:
- No manual cleanup needed
- Ensures your admin dashboard stays accurate
- Prevents orphaned data in Firestore
- Maintains data consistency

### 2. `cleanupOrphanedData` (Manual - Admin Only)

**Trigger**: Manually called by admin via Firebase Console or CLI

**What it does**:
- Scans for users in Firestore that don't exist in Firebase Auth
- Supports dry-run mode to preview before deletion
- Deletes all data for orphaned users when confirmed

**Usage**:
```bash
# Dry run - see what would be deleted
firebase functions:call cleanupOrphanedData --data '{"dryRun": true}'

# Actually delete orphaned data
firebase functions:call cleanupOrphanedData --data '{"dryRun": false}'
```

**Access**: Only admin (hussein.srour@thakralone.com) can call this function

## Deployment

### Prerequisites

1. **Upgrade to Blaze Plan**:
   - Go to: https://console.firebase.google.com/project/mwci-tracker/overview
   - Click "Upgrade" in the left sidebar
   - Select **Blaze (Pay as you go)** plan
   - **Don't worry!** Free tier includes:
     - 2 million function invocations/month
     - 400,000 GB-seconds/month
     - 200,000 CPU-seconds/month
   - For your app size, you'll likely stay 100% free

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:cleanupUserData
firebase deploy --only functions:cleanupOrphanedData
```

### Verify Deployment

After deployment:
1. Go to Firebase Console → Functions
2. You should see two functions listed:
   - `cleanupUserData`
   - `cleanupOrphanedData`

### Test It

1. **Test Automatic Cleanup**:
   - Go to Firebase Console → Authentication
   - Delete a test user
   - Check Cloud Functions logs - you should see cleanup logs
   - Check Firestore - user data should be deleted

2. **Test Manual Cleanup** (for existing orphaned data):
   ```bash
   firebase functions:call cleanupOrphanedData --data '{"dryRun": true}'
   ```

## Logs

View function logs:
```bash
# All logs
firebase functions:log

# Specific function
firebase functions:log --only cleanupUserData
```

Or view in Firebase Console → Functions → Logs

## Cost Estimate

Based on your app size (small team):
- **Expected invocations**: ~50-100/month
- **Free tier limit**: 2,000,000/month
- **Estimated cost**: $0.00/month

You'll stay well within the free tier!

## Development

### Build
```bash
npm run build
```

### Local Testing
```bash
npm run serve
```

### Logs
```bash
npm run logs
```

## Troubleshooting

**Function not deploying?**
- Ensure you're on Blaze plan
- Check you're logged in: `firebase login`
- Verify project: `firebase use mwci-tracker`

**Function not triggering?**
- Check Cloud Functions logs for errors
- Verify the function is deployed (Firebase Console → Functions)
- Ensure user deletion is happening in Firebase Auth, not just Firestore

**Need help?**
- Check logs: `firebase functions:log`
- Firebase Console: https://console.firebase.google.com/project/mwci-tracker/functions
