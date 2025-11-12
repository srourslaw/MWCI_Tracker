import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function that automatically deletes user data from Firestore
 * when a user is deleted from Firebase Authentication
 *
 * This ensures data consistency - when you delete a user from Auth,
 * their profile, tasks, and other data are automatically cleaned up.
 */
export const cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const email = user.email || 'unknown';

  console.log(`🗑️  User deleted from Auth: ${email} (${uid})`);
  console.log(`🧹 Starting automatic cleanup of user data...`);

  try {
    const db = admin.firestore();
    const batch = db.batch();
    let deletionCount = 0;

    // 1. Delete user profile from 'users' collection
    const userProfileRef = db.collection('users').doc(uid);
    const userProfileSnap = await userProfileRef.get();
    if (userProfileSnap.exists) {
      batch.delete(userProfileRef);
      deletionCount++;
      console.log(`  ✓ Queued deletion: User profile`);
    }

    // 2. Delete all user's tasks from 'tasks' collection
    const userTasksQuery = await db.collection('tasks').where('userId', '==', uid).get();
    userTasksQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
      deletionCount++;
    });
    console.log(`  ✓ Queued deletion: ${userTasksQuery.size} tasks`);

    // 3. Delete user's 2FA codes from 'twoFactorCodes' collection
    const twoFactorCodeRef = db.collection('twoFactorCodes').doc(uid);
    const twoFactorCodeSnap = await twoFactorCodeRef.get();
    if (twoFactorCodeSnap.exists) {
      batch.delete(twoFactorCodeRef);
      deletionCount++;
      console.log(`  ✓ Queued deletion: 2FA codes`);
    }

    // 4. Delete user's KPI entries if they exist
    const userKPIsQuery = await db.collection('kpis').where('userId', '==', uid).get();
    userKPIsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
      deletionCount++;
    });
    if (userKPIsQuery.size > 0) {
      console.log(`  ✓ Queued deletion: ${userKPIsQuery.size} KPI entries`);
    }

    // Execute all deletions
    await batch.commit();

    console.log(`✅ Successfully deleted ${deletionCount} documents for user ${email}`);
    console.log(`🎉 User data cleanup complete!`);

    return {
      success: true,
      uid,
      email,
      deletedDocuments: deletionCount,
    };
  } catch (error) {
    console.error(`❌ Error cleaning up user data for ${email}:`, error);

    // Don't throw error - we don't want the function to fail
    // Even if cleanup fails, the user is already deleted from Auth
    return {
      success: false,
      uid,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

/**
 * Optional: Manually trigger cleanup for orphaned data
 * Call this function with: firebase functions:call cleanupOrphanedData --data '{"dryRun": true}'
 */
export const cleanupOrphanedData = functions.https.onCall(async (data, context) => {
  // Only allow admins to call this function
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const adminEmail = 'hussein.srour@thakralone.com';
  if (context.auth.token.email !== adminEmail) {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can cleanup orphaned data');
  }

  const dryRun = data.dryRun === true;
  console.log(`🔍 Scanning for orphaned user data... (Dry run: ${dryRun})`);

  try {
    const db = admin.firestore();

    // Get all user IDs from Authentication
    const authUsers = await admin.auth().listUsers();
    const authUserIds = new Set(authUsers.users.map(u => u.uid));

    // Get all user profiles from Firestore
    const firestoreUsers = await db.collection('users').get();
    const orphanedProfiles: string[] = [];

    firestoreUsers.docs.forEach(doc => {
      if (!authUserIds.has(doc.id)) {
        orphanedProfiles.push(doc.id);
      }
    });

    console.log(`📊 Found ${orphanedProfiles.length} orphaned user profiles`);

    if (dryRun) {
      return {
        dryRun: true,
        orphanedProfiles,
        message: `Found ${orphanedProfiles.length} orphaned profiles. Set dryRun=false to delete them.`,
      };
    }

    // Delete orphaned data
    let totalDeleted = 0;
    for (const uid of orphanedProfiles) {
      const batch = db.batch();

      // Delete user profile
      batch.delete(db.collection('users').doc(uid));

      // Delete tasks
      const tasks = await db.collection('tasks').where('userId', '==', uid).get();
      tasks.docs.forEach(doc => batch.delete(doc.ref));

      // Delete 2FA codes
      batch.delete(db.collection('twoFactorCodes').doc(uid));

      // Delete KPIs
      const kpis = await db.collection('kpis').where('userId', '==', uid).get();
      kpis.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      totalDeleted++;
      console.log(`  ✓ Cleaned up orphaned data for user: ${uid}`);
    }

    console.log(`✅ Cleanup complete! Deleted data for ${totalDeleted} orphaned users`);

    return {
      success: true,
      orphanedProfiles,
      deletedCount: totalDeleted,
    };
  } catch (error) {
    console.error('❌ Error during orphaned data cleanup:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cleanup orphaned data');
  }
});
