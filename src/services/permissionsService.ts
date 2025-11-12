import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { ColumnPermission, ColumnPermissionInput, ColumnName } from '../types/permissions'
import { logger } from '../utils/logger'

const PERMISSIONS_COLLECTION = 'columnPermissions'

export const permissionsService = {
  // Create or update column permission
  async setColumnPermission(
    userId: string,
    permissionInput: ColumnPermissionInput
  ): Promise<string> {
    // Check if permission already exists for this column
    const existingQuery = query(
      collection(db, PERMISSIONS_COLLECTION),
      where('columnName', '==', permissionInput.columnName)
    )
    const existingDocs = await getDocs(existingQuery)

    if (!existingDocs.empty) {
      // Update existing permission
      const docId = existingDocs.docs[0].id
      await updateDoc(doc(db, PERMISSIONS_COLLECTION, docId), {
        assignedUsers: permissionInput.assignedUsers,
        updatedAt: Timestamp.now(),
      })
      logger.log('📝 Updated column permission:', permissionInput.columnName)
      return docId
    } else {
      // Create new permission
      const permissionData = {
        ...permissionInput,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
      }

      const docRef = await addDoc(collection(db, PERMISSIONS_COLLECTION), permissionData)
      logger.log('✅ Created column permission:', permissionInput.columnName)
      return docRef.id
    }
  },

  // Subscribe to all column permissions (real-time)
  subscribeToPermissions(
    callback: (permissions: ColumnPermission[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(collection(db, PERMISSIONS_COLLECTION))

    return onSnapshot(
      q,
      (snapshot) => {
        const permissions: ColumnPermission[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            columnName: data.columnName,
            columnDisplayName: data.columnDisplayName,
            assignedUsers: data.assignedUsers || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdBy: data.createdBy,
          } as ColumnPermission
        })
        callback(permissions)
      },
      (error) => {
        logger.error('Error fetching permissions:', error)
        if (onError) onError(error as Error)
      }
    )
  },

  // Check if user can edit a specific column
  async canUserEditColumn(userEmail: string, columnName: ColumnName, isAdmin: boolean): Promise<boolean> {
    // Admins can always edit everything
    if (isAdmin) return true

    // Get permissions for this column
    const q = query(
      collection(db, PERMISSIONS_COLLECTION),
      where('columnName', '==', columnName)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      // No permissions set = nobody can edit (except admin)
      return false
    }

    const permission = snapshot.docs[0].data()
    return permission.assignedUsers.includes(userEmail)
  },

  // Get all columns a user can edit
  async getUserEditableColumns(userEmail: string, isAdmin: boolean): Promise<ColumnName[]> {
    // Admins can edit everything
    if (isAdmin) {
      // Return all possible columns
      return [
        'category',
        'name',
        'signoffStatus',
        'owner',
        'devStatus',
        'devCompletion',
        'remarks',
        'customerDependency',
        'customerDependencyStatus',
        'revisedDevStatus',
        'sitStatus',
        'sitCompletion',
        'uatStatus',
        'uatCompletion',
        'prodStatus',
        'prodCompletion',
      ]
    }

    const snapshot = await getDocs(collection(db, PERMISSIONS_COLLECTION))
    const editableColumns: ColumnName[] = []

    snapshot.docs.forEach((doc) => {
      const permission = doc.data()
      if (permission.assignedUsers.includes(userEmail)) {
        editableColumns.push(permission.columnName as ColumnName)
      }
    })

    return editableColumns
  },

  // Delete column permission
  async deletePermission(permissionId: string): Promise<void> {
    await deleteDoc(doc(db, PERMISSIONS_COLLECTION, permissionId))
    logger.log('🗑️ Deleted column permission')
  },

  // Get permission for specific column
  async getColumnPermission(columnName: ColumnName): Promise<ColumnPermission | null> {
    const q = query(
      collection(db, PERMISSIONS_COLLECTION),
      where('columnName', '==', columnName)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      columnName: data.columnName,
      columnDisplayName: data.columnDisplayName,
      assignedUsers: data.assignedUsers || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as ColumnPermission
  },
}
