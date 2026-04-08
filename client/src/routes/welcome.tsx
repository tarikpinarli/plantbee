import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/utils/helper";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/welcome")({
  beforeLoad: requireAuth,
  component: RouteComponent,
});

// const getWelcome = async () => {
//   try {
//     const res = await fetch("/api/user/welcome", { method:"POST", credentials: "include" });
//     const data = await res.json();
//     console.log(data);
//   } catch (error) {
//     console.error(error);
//   }
// }

function RouteComponent() {
  const { user } = useAuth();

  useEffect(() => {
    console.log("Welcome route user:", user);
  }, []);

  return (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
        <span className="text-xs font-bold uppercase tracking-wider">
          New Member Onboarding
        </span>
      </div>
      <section className="p-2">
        {user && <h1>Welcome, {user.login}, to PlantBee!</h1>}
        <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          Grow something{" "}
          <span className="text-primary  decoration-primary/30 underline-offset-8">
            great{" "}
          </span>
          together.
        </h1>
        <div className="max-w-4xl w-full px-6 text-center">
          <h2> Choose your role</h2>
          <p>How would you like to participate in PlantBee ecosystem?</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary shadow-xl ring-4 ring-primary/10 group cursor-pointer hover:-translate-y-1 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                Recommended
              </div>
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-6 self-center">
                <span className="material-symbols-outlined text-background-dark text-4xl">
                  volunteer_activism
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Become a Volunteer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                Get notified when plants near you need water or attention. Track
                your impact and climb the campus leaderboard.
              </p>
              <button className="w-full py-4 bg-primary text-background-dark font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                Select Volunteer{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>

            <div className="flex flex-col p-8 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all cursor-pointer flex-grow group">
              <div className="size-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 self-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 group-hover:text-primary transition-colors text-4xl">
                  visibility
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Continue as Observer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                Browse the map and check plant health stats without committing
                to care tasks. You can still see all data.
              </p>
              <button className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Select Observer
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
