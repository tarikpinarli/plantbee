// Top navigation bar

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { SharedButton } from "../ui/CustomedButton";
import { NavLink } from "../ui/NavLink";

export function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const hideNavbarRoutes = ["/login", "/welcome"];

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
          <Link to="/" className="flex items-center gap-3 text-[#13ec5b]">
            <span className="text-3xl font-bold -tracking-wide text-[#09431c] dark:text-slate-100 md:text-3xl leading-tight max-w-180">
              PlantBee
            </span>
          </Link>
          <nav className="flex items-center gap-6">
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
              </ul>
            )}

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
              <SharedButton onClick={logout}>LOG OUT</SharedButton>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
