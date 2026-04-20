// import { twMerge } from "tailwind-merge";

type ProgressBarProps = {
  // title: string;
  // progress: number;
  styles?: string;
  currentMoisture: number;
  targetMoisture: number;
};

// export const ProgressBar = ({ title, progress, styles }: ProgressBarProps) => (
//   <div className="bg-green-300/10 dark:bg-primary/10 rounded-lg p-3 border border-green-300/30">
//     <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
//       {title}
//     </p>
//     <div className="flex items-center gap-2">
//       <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
//         {progress}%
//       </span>
//       <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
//         <div
//           className={twMerge(`bg-green-500 h-full w-[${progress}%]`, styles)}
//         ></div>
//       </div>
//     </div>
//   </div>
// );

export const ProgressBar = ({
  currentMoisture,
  targetMoisture,
}: ProgressBarProps) => (
  <>
  <div className=" bg-slate-50 border border-slate-100 rounded-xl py-4 px-8 mt-auto w-full">
    <div className="flex justify-between items-end mb-2">
      <div>
        <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1">
          <span className="text-blue-500 text-sm">💧</span> Current
        </p>
        <p className={`font-bold text-lg ${currentMoisture < targetMoisture ? "text-orange-400" : "text-blue-500"}`}>{currentMoisture}%</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-0.5">
          Target
        </p>
        <p className="font-bold text-lg text-green-600">{targetMoisture}%</p>
      </div>
    </div>
    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden relative mt-1">
      {/* Target Marker Indicator */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
        style={{ left: `${targetMoisture}%`, transform: "translateX(-50%)" }}
      />

      {/* Current Moisture Fill */}
      <div
        className={`h-full rounded-full transition-all duration-1000 ${currentMoisture < targetMoisture ? "bg-orange-400" : "bg-blue-500"}`}
        style={{ width: `${currentMoisture}%` }}
      />
    </div></div>
  </>
);
