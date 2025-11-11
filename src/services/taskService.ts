import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Task, TaskInput } from '../types/task'

const TASKS_COLLECTION = 'tasks'

export const taskService = {
  // Create a new task
  async createTask(userId: string, userEmail: string, taskInput: TaskInput): Promise<string> {
    const now = Timestamp.now()
    const taskData = {
      ...taskInput,
      userId,
      userEmail,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData)
    return docRef.id
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<TaskInput>): Promise<void> {
    const taskRef = doc(db, TASKS_COLLECTION, taskId)
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, TASKS_COLLECTION, taskId)
    await deleteDoc(taskRef)
  },

  // Subscribe to user's tasks (real-time)
  subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            title: data.title,
            description: data.description || '',
            status: data.status,
            date: data.date,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Task
        })
        callback(tasks)
      },
      (error) => {
        console.error('Error fetching tasks:', error)
        if (onError) onError(error as Error)
      }
    )
  },

  // Subscribe to all tasks (for admin)
  subscribeToAllTasks(
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, TASKS_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            title: data.title,
            description: data.description || '',
            status: data.status,
            date: data.date,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Task
        })
        callback(tasks)
      },
      (error) => {
        console.error('Error fetching all tasks:', error)
        if (onError) onError(error as Error)
      }
    )
  },

  // Get user task statistics
  async getUserStats(userId: string): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
  }> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId)
    )

    const snapshot = await getDocs(q)
    const tasks = snapshot.docs.map(doc => doc.data())

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    }
  },

  // Get all tasks statistics (for admin)
  async getAllStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    activeProjects: number
    teamMembers: number
  }> {
    const snapshot = await getDocs(collection(db, TASKS_COLLECTION))
    const tasks = snapshot.docs.map(doc => doc.data())

    const uniqueUsers = new Set(tasks.map(t => t.userId))

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      activeProjects: Math.ceil(uniqueUsers.size / 2), // Estimate: 2 users per project
      teamMembers: uniqueUsers.size,
    }
  },
}
