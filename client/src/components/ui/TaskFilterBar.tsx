import type { Task } from "@/types/plant.types";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const statusOptions: (Task["status"] | "all")[] = [
    "all",
    "open",
    "in_progress",
    "completed",
  ];
  const typeOptions: (Task["type"] | "all")[] = [
    "all",
    "water",
    "error",
  ];

  const statusLabel = (s: Task["status"] | "all") => {
    if (s === "all") return t("tasks.filters.all");
    if (s === "open") return t("tasks.filters.open");
    if (s === "in_progress") return t("tasks.filters.inProgress");
    return t("tasks.filters.completed");
  };

  const typeLabel = (ty: Task["type"] | "all") => {
    if (ty === "all") return t("tasks.filters.allTypes");
    if (ty === "water") return t("tasks.filters.water");
    return t("tasks.filters.error");
  };

  return (
    <div className="my-4">
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("tasks.filters.view")}
          </span>
          <button
            onClick={() => onMyTasksChange(!showMyTasks)}
            className={twMerge(
              "px-2.5 py-1 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap",
              showMyTasks
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-600 border-slate-300 hover:border-primary",
            )}
          >
            {t("tasks.filters.myTasks")}
          </button>
        </div>

        <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("tasks.filters.status")}
          </span>

          <div className="flex gap-1.5 flex-wrap">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={twMerge(
                  "px-2 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap",
                  statusFilter === s
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-slate-600 border-slate-300 hover:border-green-700 hover:bg-slate-50",
                )}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-8 bg-slate-400 dark:bg-slate-700" />

        {/* type filter */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("tasks.filters.type")}
          </span>
          <div className="flex gap-1.5">
            {typeOptions.map((ty) => (
              <button
                key={ty}
                onClick={() => onTypeChange(ty)}
                className={twMerge(
                  "px-2 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap",
                  typeFilter === ty
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-slate-600 border-slate-300 hover:border-green-700 hover:bg-slate-50",
                )}
              >
                {typeLabel(ty)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-2 mt-3">
        <h2 className="text-base font-semibold text-green-700 dark:text-slate-300">
          {showMyTasks ? t("tasks.filters.myTasksTitle") : t("tasks.filters.allTasksTitle")}
          {statusFilter !== "all" && (
            <span className="ml-1.5 text-primary capitalize">
              · {statusLabel(statusFilter)}
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="ml-1.5 text-blue-500 capitalize">
              · {typeFilter === "water" ? t("tasks.filters.waterFilter") : t("tasks.filters.errorFilter")}
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-500 whitespace-nowrap">
          {t("tasks.filters.results", { count: totalResults })}
        </p>
      </div>
    </div>
  );
};
