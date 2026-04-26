import { updateUser } from "@/api/user.api";
import { SharedButton } from "@/components/ui/CustomedButton";
import { StatusTag } from "@/components/ui/StatusTag";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: Profile,
});

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [intendedToHelp, setIntendedToHelp] = useState(
    user?.intendToHelp || false,
  );
  const [showToast, setShowToast] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(t("profile.confirmDelete"));
    if (!confirmed) return;
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert(t("profile.deletedAlert"));
        setUser(null);
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(t("profile.deleteError"));
    }
  };

  const updateUserRole = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIntendedToHelp(evt.target.checked);
    const res = await updateUser("role", "PATCH", {
      intend_to_help: evt.target.checked,
    });
    if (res) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <>
      <div className="relative flex flex-col items-center md:flex-row md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-primary/5 w-full">
        {showToast && (
          <Toast
            message={t("profile.roleUpdated", {
              role: intendedToHelp ? t("profile.volunteer") : t("profile.observer"),
            })}
          />
        )}
        <div className="relative shrink-0">
          <div
            className={`size-32 rounded-full border-2 ${intendedToHelp ? "border-green-300" : "border-primary/20"} p-1`}
          >
            <img
              alt={user.login}
              className="size-full rounded-full object-cover"
              data-alt={user.login}
              src={user.imageUrl}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center text-center md:text-left space-y-1 flex-1">
          <h1 className="text-3xl font-bold">{user.login}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {user.email}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            <StatusTag
              status={intendedToHelp ? t("profile.volunteer") : t("profile.observer")}
              styles={
                intendedToHelp
                  ? "bg-green-100 text-green-800"
                  : "bg-primary/10 text-primary"
              }
            />
          </div>
        </div>
        <div className="flex justify-center md:justify-end mt-4 md:mt-0 shrink-0">
          <div className="flex flex-col items-center justify-center bg-linear-to-br from-emerald-400 to-teal-500 text-white rounded-2xl p-6 shadow-lg min-w-36 transform transition hover:-translate-y-1 hover:shadow-xl">
            <span className="text-4xl font-black mb-1">🪙 {user.waterCount}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-90 text-emerald-50">{t("profile.totalPoints")}</span>
          </div>
        </div>
      </div>

      <section className="space-y-4 my-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-center md:text-left max-w-2xl">
            <h2 className="text-lg font-semibold mb-1">
              {t("profile.changeRole")}
            </h2>
            <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("profile.changeRoleHint")}
            </p>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={intendedToHelp}
                className="sr-only peer"
                type="checkbox"
                onChange={updateUserRole}
              />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:inset-s-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"/>
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-red-50/30 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/50 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
              {t("profile.deleteAccount")}
            </h2>
            <p className="text-md text-red-600/80 dark:text-red-400/60 mt-1 max-w-md">
              {t("profile.deleteAccountWarning")}
            </p>
          </div>
          <SharedButton
            className="bg-red-500 hover:bg-red-700 text-white hover:text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-red-500/20 active:scale-95 whitespace-nowrap"
            onClick={handleDeleteAccount}
          >
            {t("profile.deleteAccount")}
          </SharedButton>
        </div>
      </section>
    </>
  );
}
