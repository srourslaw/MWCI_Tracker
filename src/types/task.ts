export interface Task {
  id: string
  userId: string
  userEmail: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  date: string
  createdAt: Date
  updatedAt: Date
}

export type TaskInput = Omit<Task, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>
