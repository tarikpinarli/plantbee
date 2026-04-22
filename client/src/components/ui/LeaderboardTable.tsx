import type { LeaderboardItem } from "@/types/leaderboard.types"
import { LeaderboardTableHead, LeaderboardTableRow } from "./LeaderboardComponent";

type TableProps = {
	data: LeaderboardItem[];
	currentUserId?: number;
}

export const LeaderboardTable = ({data, currentUserId}: TableProps) => {
	
		return (
		<div className="mt-12">
			{/* Section Header */}
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-2xl font-black text-green-600">Full Rankings</h3>
				<div className="flex gap-2">
					<button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">All Time</button>
					<button className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">This Month</button>
				</div>
			</div>

			{/* Table Container */}
			<div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200">
				<table className="w-full text-left">
					{/* Table Head */}
					<LeaderboardTableHead />

					{/* Table Body */}
					<tbody className="divide-y divide-gray-500">
						{data.map((user, idx) => {
							const isMe = user.user_id === currentUserId;
							return (
								<LeaderboardTableRow 
									key={user.user_id}
									user={user}
									index={idx}
									isMe={isMe}
								/>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* CTA Section */}
			<div className="mt-12 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
				<div className="max-w-2xl">
					<h4 className="text-2xl font-black mb-3">Want to climb the ranks?</h4>
					<p className="text-gray-300 mb-6">Every watering task completed earns you points. Visit the task board to see which plants need your attention right now.</p>
					<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
						View Active Tasks
					</button>
				</div>

				{/* Stats Row */}
				<div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-700">
					<div>
						<div className="text-emerald-400 text-sm font-bold tracking-widest mb-1">TOTAL LITERS</div>
						<div className="text-4xl font-black">14.2k</div>
					</div>
					<div>
						<div className="text-emerald-400 text-sm font-bold tracking-widest mb-1">ACTIVE GUARDIANS</div>
						<div className="text-4xl font-black">452</div>
					</div>
				</div>
			</div>
		</div>
	);
}