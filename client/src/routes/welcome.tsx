import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/user.types";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import bee from "../assets/bee.svg";
import volunteer from "../assets/volunteer.svg";
import { SharedButton } from "@/components/ui/CustomedButton";
import { StatusTag } from "@/components/ui/StatusTag";

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

function RouteComponent() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<UserRole>(null);
  const navigate = useNavigate();

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-white to-green-100 w-full">
      <StatusTag
        status="New member onboarding"
        styles="bg-green-200 text-[#09431c] border border-[#09431c]"
      />
      <section className="max-w-4xl w-full px-6 py-12 text-center">
        <h1 className="text-5xl md:text-6xl">
          Welcome,{" "}
          <span className=" text-[#09431c] font-black">{user.login}</span>, to{" "}
          <span className="font-black text-[#09431c] ">PlantBee</span>! 🌼 Grow
          something great together.
        </h1>

        <div className="max-w-4xl w-full px-6 py-6 text-center mt-6">
          <h2 className="text-3xl font-bold">Choose your first role 🌱🐝</h2>
          <p className="my-3 text-lg">
            How would you like to participate in PlantBee ecosystem?
          </p>

          <div className="grid md:grid-cols-2 gap-10 mt-10 mb-6">
            <div
              id="volunteer"
              onClick={() => setSelected("volunteer")}
              className={`relative flex items-center gap-3 flex-col p-8 rounded-2xl hover:bg-slate-50 dark:bg-slate-900 border-3 hover:shadow-2xl ring-3 ring-primary/10 hover:ring-green-300 group cursor-pointer hover:-translate-y-1 transition-all ${
                selected === "volunteer"
                  ? "border-green-500 bg-white dark:bg-slate-900"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <StatusTag
                status="Recommended for plant lovers 💖"
                styles="bg-green-200 text-[#09431c] border-1 border-green-400 absolute -top-4 left-1/2 -translate-x-1/2 w-max"
              />
              <img src={volunteer} alt="volunteer icon" className="w-14 h-14" />
              <h3 className="text-2xl font-bold mb-3">Become a Volunteer</h3>
              <p className="text-md text-slate-700 dark:text-slate-400 mb-8">
                Get notified when plants near you need water or attention. Track
                your impact and climb the campus leaderboard!
              </p>
            </div>

            <div
              id="observer"
              onClick={() => setSelected("observer")}
              className={`relative flex items-center gap-3 flex-col p-8 rounded-2xl hover:bg-white dark:bg-slate-900 border-3 hover:shadow-2xl ring-2 ring-primary/10 hover:ring-green-300 group cursor-pointer hover:-translate-y-1 transition-all ${
                selected === "observer"
                  ? "border-green-500 bg-white dark:bg-slate-900"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <img src={bee} alt="observer icon" className="w-14 h-14" />
              <h3 className="text-2xl font-bold mb-3">
                Continue as an Observer
              </h3>
              <p className="text-md text-slate-700 dark:text-slate-400 mb-8">
                Browse the map and check plant health stats without committing
                to care tasks. You can still see all data.
              </p>
            </div>
          </div>
          <p className="text-lg">
            Don't worry, you can always switch roles later in your profile
            settings.
          </p>
        </div>

        <SharedButton
          disabled={!selected}
          onClick={ async () => {
            const intendToHelp = selected === "volunteer";
            const res = await updateUserRole(intendToHelp);

            if (res.message) {
              navigate({ to: "/tasks" });
            }
          }}
          className="disabled:opacity-50 min-w-md"
        >
          Continue
        </SharedButton>
      </section>
    </div>
  );
}
