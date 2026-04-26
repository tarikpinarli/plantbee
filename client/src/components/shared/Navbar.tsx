// Top navigation bar

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { SharedButton } from "../ui/CustomedButton";
import { NavLink } from "../ui/NavLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useEffect, useState } from "react";
import logo from "@/assets/logo_upscaled.webp";

export function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const hideNavbarRoutes = ["/login", "/welcome"];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    return () => setMenuOpen(false);
  }, [currentPath]);

  if (hideNavbarRoutes.includes(currentPath)) return null;

  const logout = () => {
    fetch("/auth/logout", {
      credentials: "include",
    });
    setUser(null);
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#09431c]/20 dark:bg-[#09431c]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-[#13ec5b] group">
            <img src={logo} alt="PlantBee Logo" className="w-12 h-12 object-contain transition-transform group-hover:scale-105" />
            <span className="text-3xl font-bold -tracking-wide text-[#09431c] dark:text-slate-100 md:text-3xl leading-tight max-w-180">
              PlantBee
            </span>
          </Link>
          <nav className="items-center gap-6 hidden md:flex">
            {user && (
              <ul className="flex items-center gap-6">
                <li>
                  <NavLink href="/garden">Garden</NavLink>
                </li>
                <li>
                  <NavLink href="/tasks">Tasks</NavLink>
                </li>
                <li>
                  <NavLink href="/addPlant">Add Plant</NavLink>
                </li>
                <li>
                  <NavLink href="/leaderboard">Leaderboard</NavLink>
                </li>
              </ul>
            )}

            <LanguageSwitcher />

            {user && (
              <Link to="/profile">
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </Link>
            )}

            {!user ? (
              <Link to="/login">LOG IN</Link>
            ) : (
              <SharedButton onClick={logout} className="m-0">
                LOG OUT
              </SharedButton>
            )}
          </nav>
          {/* mobile — hamburger button */}
          <button
            className="md:hidden cursor-pointer text-4xl text-[#09431c] dark:text-slate-100 font-extrabold"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {/* mobile dropdown menu */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col items-center gap-5 px-6 py-4 border-t border-[#09431c]/20 bg-white dark:bg-[#09431c]/80">
            {user && (
              <>
                <NavLink href="/garden">Garden</NavLink>
                <NavLink href="/tasks">Tasks</NavLink>
                <NavLink href="/addPlant">Add Plant</NavLink>
                <NavLink href="/leaderboard">Leaderboard</NavLink>
                <Link to="/profile" className="flex items-center gap-2">
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  {user.login}
                </Link>
              </>
            )}
            <LanguageSwitcher />
            {!user ? (
              <Link to="/login">LOG IN</Link>
            ) : (
              <SharedButton onClick={logout} className="m-0 w-sm">
                LOG OUT
              </SharedButton>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
