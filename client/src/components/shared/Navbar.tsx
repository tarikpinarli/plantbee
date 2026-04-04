// Top navigation bar

import { Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function Navbar() {
  const { user: currentUSer } = useCurrentUser();
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#09431c]/20 bg-[#88da88]/80 dark:bg-[#09431c]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-[#13ec5b]">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              PlantBee
            </span>
          </Link>
          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {currentUSer && (
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
            {!currentUSer ? <Link to="/login">LOG IN</Link> : <button>LOG OUT</button>}
          </nav>
        </div>
      </header>
    </>
  );
}
