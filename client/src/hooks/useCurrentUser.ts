// (already exists) get logged-in user
import type { User } from "@/types/user.types";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCallback = async () => {
      try {
        const res = await fetch("/auth/me", { credentials: "include" });
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        setUser(null);
        console.error(error);
      }
    };
    getCallback();
  }, []);

  return { user };
};
