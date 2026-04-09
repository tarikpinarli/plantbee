import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/welcome")({
  beforeLoad: requireAuth,
  component: RouteComponent,
});

const updateUserRole = async (selected: boolean) => {
  try {
    const res = await fetch("/api/user/welcome", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intend_to_help: selected }),
    });
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
type UserRole = "volunteer" | "observer" | null;

function RouteComponent() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<UserRole>(null);
  const navigate = useNavigate();

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
            <div
              id="volunteer"
              onClick={() => setSelected("volunteer")}
              className={`relative flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary shadow-xl ring-4 ring-primary/10 group cursor-pointer hover:-translate-y-1 transition-all ${
                selected === "volunteer"
                  ? "border-green-400 bg-green-50"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                Recommended
              </div>
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-6 self-center">
                {/* <span className="material-symbols-outlined text-background-dark text-4xl">
                  volunteer_activism
                </span> */}
              </div>
              <h3 className="text-2xl font-bold mb-3">Become a Volunteer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 grow">
                Get notified when plants near you need water or attention. Track
                your impact and climb the campus leaderboard.
              </p>
            </div>

            <div
              id="observer"
              onClick={() => setSelected("observer")}
              className={`cursor-pointer rounded-2xl border-2 p-8 flex-1 hover:-translate-y-1 transition-all shadow-xl ring-4 ring-primary/10
      ${
        selected === "observer"
          ? "border-green-400 bg-green-50"
          : "border-slate-200 hover:border-green-300"
      }`}
            >
              <div className="size-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 self-center group-hover:bg-primary/20 transition-colors">
                {/* <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 group-hover:text-primary transition-colors text-4xl">
                  visibility
                </span> */}
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Continue as an Observer
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                Browse the map and check plant health stats without committing
                to care tasks. You can still see all data.
              </p>
            </div>
          </div>
          <p>
            Don't worry, you can always switch roles later in your profile
            settings.
          </p>
        </div>
        <button
          disabled={!selected}
          onClick={async () => {
            const intendToHelp = selected === "volunteer";
            const res = await updateUserRole(intendToHelp);

            if (res.message) {
              navigate({ to: "/tasks" });
            }
          }}
          className="mt-6 px-8 py-3 bg-green-400 rounded-full disabled:opacity-50"
        >
          Continue →
        </button>
      </section>
    </>
  );
}
