import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { KPI, KPIInput } from '../types/kpi'

const KPI_COLLECTION = 'kpis'

export const kpiService = {
  // Create a new KPI
  async createKPI(userId: string, kpiInput: KPIInput): Promise<string> {
    const now = Timestamp.now()
    const kpiData = {
      ...kpiInput,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    }

    const docRef = await addDoc(collection(db, KPI_COLLECTION), kpiData)
    return docRef.id
  },

  // Update a KPI
  async updateKPI(kpiId: string, updates: Partial<KPIInput>): Promise<void> {
    const kpiRef = doc(db, KPI_COLLECTION, kpiId)
    await updateDoc(kpiRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete a KPI
  async deleteKPI(kpiId: string): Promise<void> {
    const kpiRef = doc(db, KPI_COLLECTION, kpiId)
    await deleteDoc(kpiRef)
  },

  // Subscribe to all KPIs (real-time)
  subscribeToKPIs(
    callback: (kpis: KPI[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, KPI_COLLECTION),
      orderBy('category'),
      orderBy('name')
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const kpis: KPI[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            category: data.category,
            name: data.name,
            signoffStatus: data.signoffStatus,
            devStatus: data.devStatus,
            devCompletion: data.devCompletion || 0,
            sitStatus: data.sitStatus,
            sitCompletion: data.sitCompletion || 0,
            uatStatus: data.uatStatus,
            uatCompletion: data.uatCompletion || 0,
            prodStatus: data.prodStatus,
            prodCompletion: data.prodCompletion || 0,
            owner: data.owner || '',
            remarks: data.remarks || '',
            remarksDate: data.remarksDate || '',
            customerDependency: data.customerDependency || '',
            customerDependencyStatus: data.customerDependencyStatus || 'None',
            customerDependencyDate: data.customerDependencyDate || '',
            revisedDevStatus: data.revisedDevStatus || 'Not Started',
            revisedDevStatusDate: data.revisedDevStatusDate || '',
            targetDate: data.targetDate || '',
            specificDetails: data.specificDetails || '',
            jiraTicket: data.jiraTicket || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdBy: data.createdBy,
          } as KPI
        })
        callback(kpis)
      },
      (error) => {
        console.error('Error fetching KPIs:', error)
        if (onError) onError(error as Error)
      }
    )
  },

  // Get KPI statistics
  async getKPIStats() {
    const snapshot = await getDocs(collection(db, KPI_COLLECTION))
    const kpis = snapshot.docs.map(doc => doc.data())

    const total = kpis.length
    const notStarted = kpis.filter(k => k.devStatus === 'Not Started').length
    const inProgress = kpis.filter(k => k.devStatus === 'In Progress').length
    const completed = kpis.filter(k => k.devStatus === 'Completed').length

    const avgDevCompletion = total > 0
      ? Math.round(kpis.reduce((sum, k) => sum + (k.devCompletion || 0), 0) / total)
      : 0

    const avgSitCompletion = total > 0
      ? Math.round(kpis.reduce((sum, k) => sum + (k.sitCompletion || 0), 0) / total)
      : 0

    const avgUatCompletion = total > 0
      ? Math.round(kpis.reduce((sum, k) => sum + (k.uatCompletion || 0), 0) / total)
      : 0

    const avgProdCompletion = total > 0
      ? Math.round(kpis.reduce((sum, k) => sum + (k.prodCompletion || 0), 0) / total)
      : 0

    return {
      total,
      notStarted,
      inProgress,
      completed,
      avgDevCompletion,
      avgSitCompletion,
      avgUatCompletion,
      avgProdCompletion,
    }
  },
}
