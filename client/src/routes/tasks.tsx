import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { acceptTask, cancelTask, getTasks } from "@/api/tasks.api";
import type { Task } from "@/types/plant.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { TaskFilterBar } from "@/components/ui/TaskFilterBar";
import { useAuth } from "@/hooks/useAuth";
import { ErrorMessageBox } from "@/components/ui/ErrorMessageBox";
import { useTranslation } from "react-i18next";

type TasksSearch = {
  status?: Task["status"] | "all";
  type?: Task["type"] | "all";
  myTasks?: boolean;
};

export const Route = createFileRoute("/tasks")({
  validateSearch: (search: Record<string, unknown>): TasksSearch => {
    return {
      status: (search.status as Task["status"] | "all") || "all",
      type: (search.type as Task["type"] | "all") || "all",
      myTasks: search.myTasks === 'true' || search.myTasks === true,
    };
  },
  component: TasksPage,
});

function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const { t } = useTranslation();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusFilter = search.status || "all";
  const typeFilter = search.type || "all";
  const showMyTasks = search.myTasks || false;

  const setStatusFilter = (status: Task["status"] | "all") => navigate({ search: (prev) => ({ ...prev, status }) });
  const setTypeFilter = (type: Task["type"] | "all") => navigate({ search: (prev) => ({ ...prev, type }) });
  const setShowMyTasks = (myTasks: boolean) => navigate({ search: (prev) => ({ ...prev, myTasks }) });

 const filtered = tasks.filter(t => {
  const matchStatus = statusFilter === 'all' || t.status === statusFilter
  const matchType = typeFilter === 'all' || (typeFilter === 'error' ? t.type !== 'water' : t.type === typeFilter)
  const matchMine = !showMyTasks || t.volunteer_id === Number(user?.id)  // ← Number() converts string id
  return matchStatus && matchType && matchMine
})

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
        setError(t("tasks.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [t]);

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
                volunteer_intra_name: user.login,
              }
            : t,
        ),
      );
    } catch (err) {
      console.error("Failed to accept task:", err);
      setError(t("tasks.acceptError"));
    }
  };

  const handleCancel = async (taskId: number) => {
    try {
      await cancelTask(taskId);
      setTasks(
        filtered.map((t) =>
          t.task_id === taskId
            ? { ...t, status: "open" as const, volunteer_id: 0, volunteer_intra_name: "" }
            : t,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel task:", err);
      setError(t("tasks.cancelError"));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg">{t("tasks.loading")}</p>
      </div>
    );
  }

  if (error) return <ErrorMessageBox message={error} />;

  return (
    <section className="p-8">
      <PageHeader
        title={t("tasks.title")}
        content={t("tasks.subtitle")}
      />
      <TaskFilterBar
        onMyTasksChange={setShowMyTasks}
        showMyTasks={showMyTasks}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        totalResults={filtered.length}
      />
      {filtered.length === 0 ? (
        <section className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">{t("tasks.empty")}</p>
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
