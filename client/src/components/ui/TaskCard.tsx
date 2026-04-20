import type { Task } from "@/types/plant.types";
import { ProgressBar } from "./ProgressBar";
import { StatusTag } from "./StatusTag";
import placeholderImg from "@/assets/placeholder.svg";
import { SharedButton } from "./CustomedButton";
import { useAuth } from "@/hooks/useAuth";
import { BASE_URL } from "@/utils/helper";

export const TaskCard = ({
  task,
  onAccept,
  onCancel,
}: {
  task: Task;
  onAccept: () => void;
  onCancel: () => void;
}) => {
  const { user } = useAuth();

  return (
    <li className="glass-card flex flex-col md:flex-row items-stretch rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex w-full md:w-64 h-48 md:h-auto bg-center bg-no-repeat bg-cover shrink-0">
        <img
          src={`${BASE_URL}${task.image_url}`}
          alt={task.plant_name}
          className="w-4/5 h-4/5 justify-center items-center mx-auto my-auto opacity-70"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImg;
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusTag
                  status="pending"
                  styles="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mb-2 uppercase tracking-wider"
                />
                <StatusTag
                  status={
                    task.type === "water" ? "💧 Water Plant" : "⚠️ Sensor Error"
                  }
                  styles={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${task.type === "water" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"} mb-2 uppercase tracking-wider`}
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">
                {task.plant_name}
              </h2>
              {task.volunteer_id != 0 && (
                <h3 className="text-md text-slate-600 dark:text-slate-400 font-medium">
                  Assigned to: {task.volunteer_id}
                </h3>
              )}
            </div>
            {task.water_needed_ml > 0 && (
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Water Needed
                </p>
                <p className="text-xl font-bold text-primary">
                  {task.water_needed_ml} ml
                </p>
              </div>
            )}
          </div>
          {task.type === "water" ? (
            <ProgressBar
              currentMoisture={task.current_moisture}
              targetMoisture={task.target_moisture}
            />
          ) : (
            <p className="bg-red-300/10 dark:bg-primary/10 rounded-lg p-3 border border-red-300/30 text-md text-red-700 dark:text-slate-400">
              {task.message}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-6">
          {task.status === "open" && (
            <SharedButton
              className="max-w-35 px-4 py-2 rounded font-semibold transition-colors"
              onClick={onAccept}
            >
              Accept task
            </SharedButton>
          )}
          {task.status === "in_progress" &&
            task.volunteer_id === Number(user?.id) && (
              <SharedButton
                className="max-w-35 bg-red-500 hover:bg-red-600 text-white px-4 py-2 transition-colors"
                onClick={onCancel}
              >
                Cancel task
              </SharedButton>
            )}
        </div>
      </div>
    </li>
  );
};
