// Top navigation bar

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const hideNavbarRoutes = ["/login", "/welcome"];

  if (hideNavbarRoutes.includes(currentPath)) return null; // Don't render the navbar on these route
  
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
              <>
                <Link
                  to="/plants"
                  className="ml text-sm font-medium text-slate-600 hover:text-[#13ec5b] dark:text-slate-400 dark:hover:text-[#13ec5b] transition"
                  activeProps={{
                    className: "text-[#13ec5b] font-semibold",
                  }}
                >
                  Plants
                </Link>
                <Link
                  to="/tasks"
                  className="text-sm font-medium text-slate-600 hover:text-[#13ec5b] dark:text-slate-400 dark:hover:text-[#13ec5b] transition"
                  activeProps={{
                    className: "text-[#13ec5b] font-semibold",
                  }}
                >
                  Tasks
                </Link>
                {/* CTA */}
                <Link
                  to="/addPlantPage"
                  className="ml-4 rounded-full bg-[#13ec5b] px-5 py-2 text-sm font-semibold text-[#102216] shadow-md hover:bg-[#13ec5b]/90 transition"
                >
                  Add Plant
                </Link>
              </>
            )}
            {!user ? (
              <Link to="/login">LOG IN</Link>
            ) : (
              <button
                onClick={() => {
                  fetch("/auth/logout", {
                    credentials: "include",
                  });
                  setUser(null);
                  navigate({ to: "/" });
                }}
              >
                LOG OUT
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
