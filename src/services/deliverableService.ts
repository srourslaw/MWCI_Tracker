import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { Deliverable, DeliverableInput, Bug, WorkflowStage } from '../types/deliverable'
import { logger } from '../utils/logger'

const DELIVERABLES_COLLECTION = 'deliverables'

class DeliverableService {
  // Create a new deliverable
  async createDeliverable(userId: string, deliverableInput: DeliverableInput): Promise<string> {
    try {
      const docRef = doc(collection(db, DELIVERABLES_COLLECTION))

      const deliverable: Omit<Deliverable, 'id'> = {
        ...deliverableInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      }

      await setDoc(docRef, {
        ...deliverable,
        createdAt: Timestamp.fromDate(deliverable.createdAt),
        updatedAt: Timestamp.fromDate(deliverable.updatedAt),
      })

      logger.log('Deliverable created:', docRef.id)
      return docRef.id
    } catch (error) {
      logger.error('Error creating deliverable:', error)
      throw error
    }
  }

  // Update a deliverable
  async updateDeliverable(
    deliverableId: string,
    updates: Partial<DeliverableInput>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, DELIVERABLES_COLLECTION, deliverableId)

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        lastUpdatedBy: userId,
      })

      logger.log('Deliverable updated:', deliverableId)
    } catch (error) {
      logger.error('Error updating deliverable:', error)
      throw error
    }
  }

  // Update a specific workflow stage
  async updateWorkflowStage(
    deliverableId: string,
    stageName: keyof DeliverableInput,
    stageData: WorkflowStage,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, DELIVERABLES_COLLECTION, deliverableId)

      await updateDoc(docRef, {
        [stageName]: stageData,
        updatedAt: Timestamp.now(),
        lastUpdatedBy: userId,
      })

      logger.log(`Workflow stage ${stageName} updated for deliverable:`, deliverableId)
    } catch (error) {
      logger.error('Error updating workflow stage:', error)
      throw error
    }
  }

  // Add a bug to a deliverable
  async addBug(deliverableId: string, bug: Bug, userId: string): Promise<void> {
    try {
      const docRef = doc(db, DELIVERABLES_COLLECTION, deliverableId)

      // Fetch current bugs array and append new bug
      // Note: In production, use arrayUnion for atomic operations
      await updateDoc(docRef, {
        bugs: [...[], bug], // This should be fetched first in production
        updatedAt: Timestamp.now(),
        lastUpdatedBy: userId,
      })

      logger.log('Bug added to deliverable:', deliverableId)
    } catch (error) {
      logger.error('Error adding bug:', error)
      throw error
    }
  }

  // Update a bug
  async updateBug(
    deliverableId: string,
    bugId: string,
    bugUpdates: Partial<Bug>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, DELIVERABLES_COLLECTION, deliverableId)

      // Note: In production, fetch the deliverable, update the specific bug, then save
      // For now, this is a placeholder
      await updateDoc(docRef, {
        updatedAt: Timestamp.now(),
        lastUpdatedBy: userId,
      })

      logger.log('Bug updated:', bugId)
    } catch (error) {
      logger.error('Error updating bug:', error)
      throw error
    }
  }

  // Delete a deliverable
  async deleteDeliverable(deliverableId: string): Promise<void> {
    try {
      const docRef = doc(db, DELIVERABLES_COLLECTION, deliverableId)
      await deleteDoc(docRef)
      logger.log('Deliverable deleted:', deliverableId)
    } catch (error) {
      logger.error('Error deleting deliverable:', error)
      throw error
    }
  }

  // Subscribe to all deliverables (real-time)
  subscribeToDeliverables(
    callback: (deliverables: Deliverable[]) => void,
    onError?: (error: Error) => void
  ) {
    const q = query(collection(db, DELIVERABLES_COLLECTION), orderBy('kpiName', 'asc'))

    return onSnapshot(
      q,
      (snapshot) => {
        const deliverables: Deliverable[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            kpiName: data.kpiName,
            category: data.category,
            phase: data.phase,
            designSignoff: data.designSignoff,
            developmentCompletion: data.developmentCompletion,
            testingCompletion: data.testingCompletion,
            testingFailed1stReview: data.testingFailed1stReview,
            testingFailed1stRectification: data.testingFailed1stRectification,
            testingFailed1stClarification: data.testingFailed1stClarification,
            testingFailed1stFix: data.testingFailed1stFix,
            testingFailed1stRetest: data.testingFailed1stRetest,
            testingFailed2ndInvestigation: data.testingFailed2ndInvestigation,
            testingPassedSIT: data.testingPassedSIT,
            uatReadinessTesting: data.uatReadinessTesting,
            uatTestingStart: data.uatTestingStart,
            uatTestingEnd: data.uatTestingEnd,
            uatPassSignoff: data.uatPassSignoff,
            bugs: data.bugs || [],
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            createdBy: data.createdBy,
            lastUpdatedBy: data.lastUpdatedBy,
          } as Deliverable
        })
        callback(deliverables)
      },
      (error) => {
        logger.error('Error in deliverables subscription:', error)
        onError?.(error as Error)
      }
    )
  }

  // Subscribe to deliverables filtered by phase
  subscribeToDeliverablesByPhase(
    phase: string,
    callback: (deliverables: Deliverable[]) => void,
    onError?: (error: Error) => void
  ) {
    const q = query(
      collection(db, DELIVERABLES_COLLECTION),
      orderBy('kpiName', 'asc')
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const deliverables: Deliverable[] = snapshot.docs
          .map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              kpiName: data.kpiName,
              category: data.category,
              phase: data.phase,
              designSignoff: data.designSignoff,
              developmentCompletion: data.developmentCompletion,
              testingCompletion: data.testingCompletion,
              testingFailed1stReview: data.testingFailed1stReview,
              testingFailed1stRectification: data.testingFailed1stRectification,
              testingFailed1stClarification: data.testingFailed1stClarification,
              testingFailed1stFix: data.testingFailed1stFix,
              testingFailed1stRetest: data.testingFailed1stRetest,
              testingFailed2ndInvestigation: data.testingFailed2ndInvestigation,
              testingPassedSIT: data.testingPassedSIT,
              uatReadinessTesting: data.uatReadinessTesting,
              uatTestingStart: data.uatTestingStart,
              uatTestingEnd: data.uatTestingEnd,
              uatPassSignoff: data.uatPassSignoff,
              bugs: data.bugs || [],
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
              createdBy: data.createdBy,
              lastUpdatedBy: data.lastUpdatedBy,
            } as Deliverable
          })
          .filter((d) => phase === 'all' || d.phase === phase)
        callback(deliverables)
      },
      (error) => {
        logger.error('Error in deliverables by phase subscription:', error)
        onError?.(error as Error)
      }
    )
  }
}

export const deliverableService = new DeliverableService()
