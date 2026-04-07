import axios from 'axios'
import type { Task } from '@/types/plant.types'

export async function getMyTasks(): Promise<Task[]> {
  const response = await axios.get('/api/tasks/my-tasks')
  return response.data || []
}

export async function getOpenTasks(): Promise<Task[]> {
  const response = await axios.get('/api/tasks/open')
  return response.data || []
}

export async function acceptTask(taskId: number): Promise<void> {
  await axios.post('/api/tasks/accept', { id: taskId })
}

export async function cancelTask(taskId: number): Promise<void> {
  await axios.post('/api/tasks/cancel', { id: taskId })
}
