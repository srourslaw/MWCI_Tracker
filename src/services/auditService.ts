import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  limit as firestoreLimit,
} from 'firebase/firestore'
import { db } from '../firebase'
import { AuditLog, AuditLogInput, AuditFilters } from '../types/audit'
import { logger } from '../utils/logger'

const AUDIT_COLLECTION = 'auditLogs'

export const auditService = {
  // Log a change
  async logChange(auditInput: AuditLogInput): Promise<string> {
    const auditData = {
      ...auditInput,
      changedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), auditData)
    logger.log('📝 Audit log created:', {
      field: auditInput.field,
      user: auditInput.changedByName,
      kpi: auditInput.kpiName,
    })
    return docRef.id
  },

  // Subscribe to audit logs (real-time)
  subscribeToAuditLogs(
    filters: AuditFilters = {},
    callback: (logs: AuditLog[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 100
  ): () => void {
    let q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('changedAt', 'desc'),
      firestoreLimit(limitCount)
    )

    // Apply filters
    if (filters.user) {
      q = query(q, where('changedByEmail', '==', filters.user))
    }
    if (filters.kpi) {
      q = query(q, where('kpiId', '==', filters.kpi))
    }
    if (filters.field) {
      q = query(q, where('field', '==', filters.field))
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            kpiId: data.kpiId,
            kpiName: data.kpiName,
            kpiCategory: data.kpiCategory,
            field: data.field,
            oldValue: data.oldValue,
            newValue: data.newValue,
            changedBy: data.changedBy,
            changedByEmail: data.changedByEmail,
            changedByName: data.changedByName,
            changedAt: data.changedAt?.toDate() || new Date(),
            changeType: data.changeType,
          } as AuditLog
        })

        // Apply date filters (client-side for flexibility)
        let filteredLogs = logs
        if (filters.startDate) {
          filteredLogs = filteredLogs.filter(
            (log) => log.changedAt >= filters.startDate!
          )
        }
        if (filters.endDate) {
          filteredLogs = filteredLogs.filter(
            (log) => log.changedAt <= filters.endDate!
          )
        }

        callback(filteredLogs)
      },
      (error) => {
        logger.error('Error fetching audit logs:', error)
        if (onError) onError(error as Error)
      }
    )
  },

  // Get all audit logs for a specific KPI
  async getKPIAuditHistory(kpiId: string): Promise<AuditLog[]> {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where('kpiId', '==', kpiId),
      orderBy('changedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        kpiId: data.kpiId,
        kpiName: data.kpiName,
        kpiCategory: data.kpiCategory,
        field: data.field,
        oldValue: data.oldValue,
        newValue: data.newValue,
        changedBy: data.changedBy,
        changedByEmail: data.changedByEmail,
        changedByName: data.changedByName,
        changedAt: data.changedAt?.toDate() || new Date(),
        changeType: data.changeType,
      } as AuditLog
    })
  },

  // Get audit statistics
  async getAuditStats() {
    const snapshot = await getDocs(collection(db, AUDIT_COLLECTION))
    const logs = snapshot.docs.map((doc) => doc.data())

    const totalChanges = logs.length
    const uniqueUsers = new Set(logs.map((log) => log.changedByEmail)).size
    const uniqueKPIs = new Set(logs.map((log) => log.kpiId)).size

    // Count by change type
    const creates = logs.filter((log) => log.changeType === 'create').length
    const updates = logs.filter((log) => log.changeType === 'update').length
    const deletes = logs.filter((log) => log.changeType === 'delete').length

    // Most active users
    const userChanges: Record<string, number> = {}
    logs.forEach((log) => {
      userChanges[log.changedByEmail] = (userChanges[log.changedByEmail] || 0) + 1
    })

    return {
      totalChanges,
      uniqueUsers,
      uniqueKPIs,
      creates,
      updates,
      deletes,
      userChanges,
    }
  },
}
