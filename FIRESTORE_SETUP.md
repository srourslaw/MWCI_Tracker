# Firestore Security Rules Setup

## Important: You Must Set Up Firestore Security Rules

Your Firestore database is currently in **test mode**, which means anyone can read and write data. This is insecure!

## Steps to Add Security Rules

### 1. Go to Firebase Console
- Visit [Firebase Console](https://console.firebase.google.com/)
- Select your project: **MWCI-Tracker**

### 2. Navigate to Firestore Database
- Click on **"Firestore Database"** in the left sidebar
- Click on the **"Rules"** tab at the top

### 3. Replace the Rules
You'll see something like this (test mode):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 1);
    }
  }
}
```

**Replace it entirely** with the content from `firestore.rules` file in this project.

### 4. Click "Publish"
- After pasting the new rules, click the **"Publish"** button
- Your database is now secure!

## What These Rules Do

✅ **Users can only see their own tasks** (except admin)
✅ **Admin (hussein.srour@thakralone.com) can see all tasks**
✅ **Only @thakralone.com emails can create tasks**
✅ **Users can only edit/delete their own tasks**
✅ **Users cannot modify userId or userEmail after creation**

## Testing the Rules

You can test the rules in the Firebase Console:
1. Go to the "Rules" tab
2. Click "Rules Playground"
3. Test different scenarios

Example test:
- **Operation**: `get`
- **Location**: `/databases/(default)/documents/tasks/someTaskId`
- **Authenticated**: Yes
- **Email**: `test@thakralone.com`
- **UID**: `testUserId123`

## Verifying Security

After publishing the rules:
1. Try creating a task in your dashboard
2. Try logging in as another user
3. Verify you can only see your own tasks
4. Log in as admin and verify you can see all tasks

## Troubleshooting

If you get "Permission Denied" errors:
- Make sure you're logged in
- Check that your email ends with @thakralone.com
- Verify the rules were published correctly
- Check the Firebase Console logs for detailed error messages
