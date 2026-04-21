import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { acceptTask, cancelTask, getTasks } from "@/api/tasks.api";
import type { Task } from "@/types/plant.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { TaskFilterBar } from "@/components/ui/TaskFilterBar";
import { useAuth } from "@/hooks/useAuth";
import { ErrorMessageBox } from "@/components/ui/ErrorMessageBox";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<Task["type"] | "all">("all");
  const [showMyTasks, setShowMyTasks] = useState(true);

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchStatus && matchType;
  });

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

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const handleAccept = async (taskId: number) => {
    try {
      await acceptTask(taskId);
      setTasks(
        filtered.map((t) =>
          t.task_id === taskId
            ? {
                ...t,
                status: "in_progress" as const,
                volunteer_id: Number(user.id),
              }
            : t,
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
        filtered.map((t) =>
          t.task_id === taskId
            ? { ...t, status: "open" as const, volunteer_id: 0 }
            : t,
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

  if (error) return <ErrorMessageBox message={error} />;

  return (
    <section className="p-8">
      <PageHeader
        title="Garden tasks"
        content="Your green companions need your help and care! Check out available tasks and keep your plants happy."
      />
      <TaskFilterBar
        onMyTasksChange={setShowMyTasks}
        showMyTasks={showMyTasks}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
      />
      {filtered.length === 0 ? (
        <section className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">No tasks assigned yet</p>
        </section>
      ) : (
        <ul className="space-y-8 mt-6">
          {filtered.map((task) => (
            <TaskCard
              key={task.task_id + task.plant_name}
              task={task}
              onAccept={() => {
                handleAccept(task.task_id);
              }}
              onCancel={() => {
                handleCancel(task.task_id);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
