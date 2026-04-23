import type { User } from "@/types/user.types";
import { redirect } from "@tanstack/react-router";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await fetch("/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    const user: User = {
      id: data.id,
      login: data.login,
      email: data.email,
      imageUrl: data.image_url,
      intendToHelp: data.intend_to_help,
      firstVisit: data.first_visit,
      waterCount: data.water_count || 0,
    };
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const requireAuth = async ({
  context,
}: {
  context: { user: User | null };
}) => {
  if (!context.user) throw redirect({ to: "/login" });
  return {};
};

 export const BASE_URL = "http://localhost:8080"