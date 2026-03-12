// Root layout (navbar lives here)
// main.tsx renders RouterProvider, the router system handles the UI instead., define the layout here

import { Navbar } from '@/components/shared/Navbar'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
  <>
    <div className="flex min-h-screen flex-col bg-[#f6f8f6] dark:bg-[#102216] font-[Space_Grotesk] text-slate-900 dark:text-slate-100">

      {/* Global Navbar */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <hr />
          <Outlet />
        </div>
      </main>

      <TanStackRouterDevtools />

    </div>
  </>
)

export const Route = createRootRoute({ component: RootLayout })