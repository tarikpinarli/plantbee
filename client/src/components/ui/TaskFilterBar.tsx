import type { Task } from "@/types/plant.types";
import { twMerge } from "tailwind-merge";

interface TaskFilterBarProps {
  statusFilter: Task["status"] | "all";
  typeFilter: Task["type"] | "all";
  showMyTasks: boolean;
  onStatusChange: (val: Task["status"] | "all") => void;
  onTypeChange: (val: Task["type"] | "all") => void;
  onMyTasksChange: (val: boolean) => void;
}

export const TaskFilterBar = ({
  statusFilter,
  typeFilter,
  showMyTasks,
  onStatusChange,
  onTypeChange,
  onMyTasksChange,
}: TaskFilterBarProps) => {
  const statusOptions: (Task["status"] | "all")[] = [
    "all",
    "open",
    "in_progress",
    "completed",
  ];
  const typeOptions: (Task["type"] | "all")[] = [
    "all",
    "water",
    "offline_error",
  ];

  return (
    <div className="flex flex-wrap gap-4 my-4 items-center">
      <button
        onClick={() => onMyTasksChange(!showMyTasks)}
        className={twMerge(
          "px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer",
          showMyTasks
            ? "bg-primary text-white border-primary"
            : "bg-white text-slate-600 border-slate-300 hover:border-primary",
        )}
      >
        🙋 My Tasks
      </button>

      <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />

      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={twMerge(
              "px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer",
              statusFilter === s
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-slate-600 border-slate-300 hover:border-green-700 hover:bg-slate-50",
            )}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />
      
      {/* type filter */}
      <div className="flex gap-2">
        {typeOptions.map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={twMerge(
              "px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer",
              typeFilter === t
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-slate-600 border-slate-300 hover:border-green-700 hover:bg-slate-50",
            )}
          >
            {t === "all" ? "All types" : t.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
};
