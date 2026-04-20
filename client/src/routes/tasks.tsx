import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { acceptTask, cancelTask, getTasks } from "@/api/tasks.api";
import type { Task } from "@/types/plant.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasks();
        console.log("Fetched tasks:", data);
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAccept = async (taskId: number) => {
    try {
      await acceptTask(taskId);
      setTasks(
        tasks.map((t) =>
          t.task_id === taskId ? { ...t, status: "in_progress" as const } : t,
        ),
      );
    } catch (err) {
      console.error("Failed to accept task:", err);
      setError("Failed to accept task. Please try again.");
    }
  };

  const handleCancel = async (taskId: number) => {
    try {
      await cancelTask(taskId);
      setTasks(
        tasks.map((t) =>
          t.task_id === taskId ? { ...t, status: "open" as const } : t,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel task:", err);
      setError("Failed to cancel task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="p-8">
      <PageHeader
        title="Garden tasks"
        content="Your green companions need your help and care! Check out available tasks and keep your plants happy."
      />

      {tasks.length === 0 ? (
        <section className="bg-gray-100 border border-gray-300 rounded p-6 text-center">
          <p className="text-gray-600">No tasks assigned yet</p>
        </section>
      ) : (
        <ul className="space-y-8 mt-6">
          {tasks.map((task) => (
            <TaskCard key={task.task_id + task.plant_name} task={task} onAccept={()=>{handleAccept(task.task_id)}} onCancel={()=>{handleCancel(task.task_id)}}/>
          ))}
          {/* {tasks.map((task) => (
            <li
              key={task.id}
              className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Plant ID: {task.plant_id}
                  </p>
                  <p className="text-sm text-gray-500">Task ID: {task.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    task.status === "open"
                      ? "bg-yellow-100 text-yellow-800"
                      : task.status === "accepted"
                        ? "bg-blue-100 text-blue-800"
                        : task.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold capitalize">
                  {task.type === "water" ? "💧 Water Plant" : "⚠️ Error Task"}
                </p>
                {task.type === "water" && task.water_amount && (
                  <p className="text-gray-700 mt-2">
                    Water needed:{" "}
                    <span className="font-bold">{task.water_amount} ml</span>
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>
                  Created: {new Date(task.scheduled_at).toLocaleDateString()} at{" "}
                  {new Date(task.scheduled_at).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex gap-2">
                {task.status === "open" && (
                  <button
                    onClick={() => handleAccept(task.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    Accept Task
                  </button>
                )}
                {task.status === "accepted" && (
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))} */}
        </ul>
      )}
    </section>
  );
}
