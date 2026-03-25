// Top navigation bar

import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <>
	<header className="sticky top-0 z-50 border-b border-[#09431c]/20 bg-[#88da88]/80 dark:bg-[#09431c]/80 backdrop-blur-md">

		<div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

			{/* Logo */}
			<Link
				to="/" 
				className="flex items-center gap-3 text-[#13ec5b]"
			>
				<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					PlantBee
				</span>
			</Link>

			{/* Navigation */}
			<nav className="flex items-center gap-6">

				<Link
					to="/"
					className="text-sm font-medium text-slate-600 hover:text-[#12ca50] dark:text-slate-400 dark:hover:text-[#13ec5b] transition"
					activeProps={{
					className: "text-[#13ec5b] font-semibold",
					}}
				>
					Home
				</Link>

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

			</nav>
		</div>

    </header>
    </>
  )
}