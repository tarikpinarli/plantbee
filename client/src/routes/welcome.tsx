import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/user.types";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import bee from "../assets/bee.svg";
import volunteer from "../assets/volunteer.svg";
import { SharedButton } from "@/components/ui/CustomedButton";
import { StatusTag } from "@/components/ui/StatusTag";
import { VolunteerCard } from "@/components/ui/VolunteerCard";

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
  if (!user.firstVisit) {
    navigate({ to: "/profile" });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-white to-green-100 w-full">
      <section className="max-w-4xl w-full px-6 py-12 text-center">
        <StatusTag
          status="New member onboarding"
          styles="bg-green-200 text-[#09431c] border border-[#09431c]"
        />
        <h1 className="text-5xl md:text-6xl mt-8">
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
            <VolunteerCard
              id="volunteer"
              onClick={() => setSelected("volunteer")}
              img={volunteer}
              alt="volunteer icon"
              status={selected}
              title="Become a Volunteer"
              description="Get notified when plants near you need water or attention. Track your impact and climb the campus leaderboard!"
            >
              <StatusTag
                status="Recommended for plant lovers 💖"
                styles="bg-green-200 text-[#09431c] border-1 border-green-400 absolute -top-4 left-1/2 -translate-x-1/2 w-max"
              />
            </VolunteerCard>
            <VolunteerCard
              id="observer"
              onClick={() => setSelected("observer")}
              img={bee}
              alt="observer icon"
              status={selected}
              title="Continue as an Observer"
              description="Browse the map and check plant health stats without committing to care tasks. You can still see all data."
            />
          </div>
          <p className="text-lg">
            Don't worry, you can always switch roles later in your profile
            settings.
          </p>
        </div>

        <SharedButton
          disabled={!selected}
          onClick={async () => {
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
