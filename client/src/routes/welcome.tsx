import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/user.types";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import bee from "../assets/bee.svg";
import logo from "../assets/logo_upscaled.webp";
import volunteer from "../assets/volunteer.svg";
import { SharedButton } from "@/components/ui/CustomedButton";
import { StatusTag } from "@/components/ui/StatusTag";
import { VolunteerCard } from "@/components/ui/VolunteerCard";
import { Trans, useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <section className="max-w-4xl w-full px-6 py-12 text-center flex flex-col items-center">
        <img src={logo} alt={t("nav.logoAlt")} className="w-24 h-24 object-contain mb-6" />
        <StatusTag
          status={t("welcome.tag")}
          styles="bg-green-200 text-[#09431c] border border-[#09431c]"
        />
        <h1 className="text-5xl md:text-6xl mt-8">
          <Trans
            i18nKey="welcome.greeting"
            values={{ name: user.login }}
            components={{
              name: <span className=" text-[#09431c] font-black" />,
              brand: <span className="font-black text-[#09431c] " />,
            }}
          />
        </h1>

        <div className="max-w-4xl w-full px-6 py-6 text-center mt-6">
          <h2 className="text-3xl font-bold">{t("welcome.chooseRole")}</h2>
          <p className="my-3 text-lg">{t("welcome.rolePrompt")}</p>

          <div className="grid md:grid-cols-2 gap-10 mt-10 mb-6">
            <VolunteerCard
              id="volunteer"
              onClick={() => setSelected("volunteer")}
              img={volunteer}
              alt={t("welcome.volunteerAlt")}
              status={selected}
              title={t("welcome.volunteerTitle")}
              description={t("welcome.volunteerDescription")}
            >
              <StatusTag
                status={t("welcome.volunteerTag")}
                styles="bg-green-200 text-[#09431c] border-1 border-green-400 absolute -top-4 left-1/2 -translate-x-1/2 w-max"
              />
            </VolunteerCard>
            <VolunteerCard
              id="observer"
              onClick={() => setSelected("observer")}
              img={bee}
              alt={t("welcome.observerAlt")}
              status={selected}
              title={t("welcome.observerTitle")}
              description={t("welcome.observerDescription")}
            />
          </div>
          <p className="text-lg">{t("welcome.switchHint")}</p>
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
          {t("welcome.continue")}
        </SharedButton>
      </section>
    </div>
  );
}
