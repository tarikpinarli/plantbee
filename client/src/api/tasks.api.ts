import type { Task } from '@/types/plant.types'

export async function getMyTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks/my-tasks')
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json() ?? []
}

export async function getTasks(statusFilter?: string): Promise<Task[]> {
  const url = statusFilter ? `/api/tasks?status=${statusFilter}` : '/api/tasks'
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json() ?? []
}

export async function getOpenTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks/open')
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json() ?? []
}

export async function acceptTask(taskId: number): Promise<void> {
  const response = await fetch('/api/tasks/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId }),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
}

export async function cancelTask(taskId: number): Promise<void> {
  const response = await fetch('/api/tasks/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId }),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
}