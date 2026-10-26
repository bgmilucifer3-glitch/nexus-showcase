export type Priority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Todo' | 'In progress' | 'Done'
export interface Task {
  id: string
  title: string
  projectId: string
  priority: Priority
  status: TaskStatus
  dueDate: string
  description: string
  createdAt: string
}
export interface Project {
  id: string
  name: string
  color: string
  description: string
  createdAt: string
}
