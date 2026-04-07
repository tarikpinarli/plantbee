// Root layout (navbar lives here)
// main.tsx renders RouterProvider, the router system handles the UI instead., define the layout here

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUser } from "@/utils/helper";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => {
  const { user } = Route.useRouteContext();
  
  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen flex-col bg-[#f6f8f6] dark:bg-[#102216] text-slate-900 dark:text-slate-100">
        {/* Global Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
            <Outlet />
          </div>
        </main>

        <Footer />
        <TanStackRouterDevtools />
      </div>
    </AuthProvider>
  );
};

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    return { user };
  },
  component: RootLayout,
});
