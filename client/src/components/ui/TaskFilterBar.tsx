import type { Task } from "@/types/plant.types";
import { twMerge } from "tailwind-merge";

interface TaskFilterBarProps {
  statusFilter: Task["status"] | "all";
  typeFilter: Task["type"] | "all";
  showMyTasks: boolean;
  onStatusChange: (val: Task["status"] | "all") => void;
  onTypeChange: (val: Task["type"] | "all") => void;
  onMyTasksChange: (val: boolean) => void;
  totalResults: number;
}

export const TaskFilterBar = ({
  statusFilter,
  typeFilter,
  showMyTasks,
  totalResults,
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
    <div className="flex flex-wrap gap-4 my-4 items-center ">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          View
        </span>
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
      </div>

      <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Status
        </span>

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
      </div>

      <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />

      {/* type filter */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Type
        </span>
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-green-700 dark:text-slate-300">
          {showMyTasks ? "My Tasks" : "All Tasks"}
          {statusFilter !== "all" && (
            <span className="ml-2 text-primary capitalize">
              · {statusFilter.replace("_", " ")}
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="ml-2 text-blue-500 capitalize">
              · {typeFilter === "water" ? "💧 Water" : "⚠️ Sensor Error"}
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-500 ml-4">
          {totalResults} {totalResults === 1 ? "task" : "tasks"} found
        </p>
      </div>
    </div>
  );
};
