import type { User } from "@/types/user.types";
import { redirect } from "@tanstack/react-router";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await fetch("/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const user = await res.json();
    // console.log("Fetched current user:", user);
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