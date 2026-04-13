import { updateUser } from "@/api/user.api";
import { SharedButton } from "@/components/ui/CustomedButton";
import { ErrorMessageBox } from "@/components/ui/ErrorMessageBox";
import { StatusTag } from "@/components/ui/StatusTag";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/utils/helper";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: Profile,
});

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [intendedToHelp, setIntendedToHelp] = useState(
    user?.intendToHelp || false,
  );
  const [showToast, setShowToast] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("Your account has been deleted successfully.");
        setUser(null);
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(
        "An error occurred while trying to delete your account. Please try again later.",
      );
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
    return (
      <ErrorMessageBox message="Failed to load profile. Please log in and try again." />
    );
  }

  return (
    <>
      <div className="relative flex flex-col items-center md:flex-row md:items-start gap-6 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-primary/5">
        {showToast && (
          <Toast
            message={`Your role has been updated to ${intendedToHelp ? "Volunteer 🐝" : "Quiet Observer 🌱"}`}
          />
        )}
        <div className="relative">
          <div className="size-32 rounded-full border-2 border-primary/20 p-1">
            <img
              alt={user.login}
              className="size-full rounded-full object-cover"
              data-alt={user.login}
              src={user.imageUrl}
            />
          </div>
          {/* Profile picture edit button */}
          {/* <button className="absolute bottom-1 right-1 bg-primary text-slate-900 p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button> */}
        </div>
        <div className="flex flex-col justify-center text-center md:text-left space-y-1">
          <h1 className="text-3xl font-bold">{user.login}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {user.email}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            <StatusTag
              status={intendedToHelp ? "Volunteer 🐝" : "Quiet Observer 🌱"}
              styles={
                intendedToHelp
                  ? "bg-green-100 text-green-800"
                  : "bg-primary/10 text-primary"
              }
            />
          </div>
        </div>
      </div>
      <section className="space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-center md:text-left max-w-2xl">
            <h2 className="text-lg font-semibold mb-1">
              Change Volunteer Status
            </h2>
            <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed">
              When active, you'll receive real-time notifications for nearby
              gardening tasks and community events. Switch to Quiet Observer to
              temporarily pause all alerts.
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
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:inset-s-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-red-50/30 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/50 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
              Delete Account
            </h2>
            <p className="text-md text-red-600/80 dark:text-red-400/60 mt-1 max-w-md">
              This action is permanent and cannot be undone. All your data,
              plant records, and achievements will be removed from our servers.
            </p>
          </div>
          <SharedButton
            className="bg-red-500 hover:bg-red-700 text-white hover:text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-red-500/20 active:scale-95 whitespace-nowrap"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </SharedButton>
        </div>
      </section>
    </>
  );
}
