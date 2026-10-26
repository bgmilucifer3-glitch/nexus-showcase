import type { Project, Task } from './types'

export const initialProjects: Project[] = [
  { id: 'p1', name: 'Website redesign', color: '#a78bfa', description: 'Refresh the brand and improve the product experience.', createdAt: '2026-10-10' },
  { id: 'p2', name: 'Mobile application', color: '#60a5fa', description: 'Build a focused mobile companion for the workspace.', createdAt: '2026-10-12' },
  { id: 'p3', name: 'Brand identity', color: '#34d399', description: 'Create a consistent visual language across touchpoints.', createdAt: '2026-10-15' },
  { id: 'p4', name: 'Marketing launch', color: '#fb923c', description: 'Prepare launch content and campaign assets.', createdAt: '2026-10-18' },
]

const today = new Date()
const date = (offset: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export const initialTasks: Task[] = [
  { id: 't1', title: 'Finalize dashboard wireframes', projectId: 'p1', priority: 'High', status: 'In progress', dueDate: date(0), description: 'Review the key dashboard flows and lock the layout.', createdAt: date(-4) },
  { id: 't2', title: 'Build reusable button system', projectId: 'p1', priority: 'Medium', status: 'Todo', dueDate: date(1), description: 'Create button variants, sizes, and interaction states.', createdAt: date(-3) },
  { id: 't3', title: 'Map onboarding experience', projectId: 'p2', priority: 'High', status: 'Todo', dueDate: date(2), description: 'Map the first-run experience from sign-up to activation.', createdAt: date(-2) },
  { id: 't4', title: 'Prepare icon exploration', projectId: 'p3', priority: 'Low', status: 'Done', dueDate: date(-1), description: 'Explore a compact icon family for the brand system.', createdAt: date(-5) },
  { id: 't5', title: 'Draft launch announcement', projectId: 'p4', priority: 'Medium', status: 'In progress', dueDate: date(3), description: 'Write a concise announcement for the launch campaign.', createdAt: date(-1) },
  { id: 't6', title: 'Review responsive breakpoints', projectId: 'p1', priority: 'High', status: 'Todo', dueDate: date(4), description: 'Check layout behavior across tablet and mobile widths.', createdAt: date(0) },
]
