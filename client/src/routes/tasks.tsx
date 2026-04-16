import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getMyTasks, getTasks, acceptTask, cancelTask } from '@/api/tasks.api'
import type { Task } from '@/types/plant.types'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})

type FilterTab = 'all' | 'open' | 'in_progress' | 'completed' | 'my_tasks'

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Tasks' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'my_tasks', label: 'My Tasks' },
]

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        let data: Task[]
        if (activeTab === 'my_tasks') {
          data = await getMyTasks()
        } else if (activeTab === 'all') {
          data = await getTasks()
        } else {
          data = await getTasks(activeTab)
        }
        setTasks(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        setError('Failed to load tasks. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [activeTab])

  const handleAccept = async (taskId: number) => {
    try {
      await acceptTask(taskId)
      // Depending on the tab, we might want to remove it from 'open' context
      // but conceptually it stays in the list as 'in_progress' unless we are on the 'open' tab
      if (activeTab === 'open') {
        setTasks(tasks.filter(t => t.task_id !== taskId))
      } else {
        setTasks(
          tasks.map(t =>
            t.task_id === taskId ? { ...t, status: 'in_progress' as const } : t
          )
        )
      }
    } catch (err) {
      console.error('Failed to accept task:', err)
      setError('Failed to accept task. Please try again.')
    }
  }

  const handleCancel = async (taskId: number) => {
    try {
      await cancelTask(taskId)
      if (activeTab === 'my_tasks' || activeTab === 'in_progress') {
        setTasks(tasks.filter(t => t.task_id !== taskId))
      } else {
        setTasks(
          tasks.map(t =>
            t.task_id === taskId ? { ...t, status: 'open' as const } : t
          )
        )
      }
    } catch (err) {
      console.error('Failed to cancel task:', err)
      setError('Failed to cancel task. Please try again.')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tasks Board</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 pb-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-teal-700 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-md'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No tasks found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.task_id}
              className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  {task.plant_name && <p className="font-bold text-gray-800">{task.plant_name}</p>}
                  <p className="text-sm text-gray-500">Plant ID: {task.plant_id}</p>
                  {(task.status as string) === 'in_progress' && task.volunteer_name && (
                    <p className="text-sm font-medium text-teal-600 mt-1">Assigned to: @{task.volunteer_name}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                    (task.status as string) === 'open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : (task.status as string) === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : (task.status as string) === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {(task.status as string).replace('_', ' ')}
                </span>
              </div>

              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                {task.image_url && (
                  <img
                    src={task.image_url}
                    alt={task.plant_name || 'Plant'}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold capitalize">
                    {task.type === 'water' ? '💧 Water Plant' : '⚠️ Maintenance Task'}
                  </p>
                  {task.type === 'water' && task.water_needed_ml && (
                    <p className="text-gray-700 mt-1">
                      Water needed: <span className="font-bold">{task.water_needed_ml} ml</span>
                    </p>
                  )}
                  {task.message && (
                    <p className="text-gray-600 italic text-sm mt-1">"{task.message}"</p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4 flex justify-between">
                <p>
                  Scheduled:{' '}
                  {new Date(task.scheduled_at).toLocaleDateString()} at{' '}
                  {new Date(task.scheduled_at).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex gap-2">
                {(task.status as string) === 'open' && (
                  <button
                    onClick={() => handleAccept(task.task_id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
                  >
                    Accept Task
                  </button>
                )}
                {((task.status as string) === 'in_progress' || (activeTab === 'my_tasks' && (task.status as string) === 'in_progress')) && (
                  <button
                    onClick={() => handleCancel(task.task_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold transition-colors"
                  >
                    Cancel Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}