import type { LeaderboardItem } from "@/types/leaderboard.types"

type TableProps = {
	data: LeaderboardItem[];
	currentUserId?: number;
}

export function LeaderboardTable({data, currentUserId}: TableProps) {
	const getBadge = (water_count: number) => {
		if (water_count >= 30) return "Pro";
		if (water_count >= 15) return "Intermediate";
		return "Sprout";
	};

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
					<thead className="bg-linear-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
						<tr>
							<th className="px-6 py-4 text-xs font-black text-emerald-700 tracking-widest">RANK</th>
							<th className="px-6 py-4 text-xs font-black text-emerald-700 tracking-widest">VOLUNTEER</th>
							<th className="px-6 py-4 text-xs font-black text-emerald-700 tracking-widest">TOTAL WATERINGS</th>
							<th className="px-6 py-4 text-xs font-black text-emerald-700 tracking-widest">BADGE LEVEL</th>
						</tr>
					</thead>

					{/* Table Body */}
					<tbody className="divide-y divide-gray-200">
						{data.map((user, idx) => {
							const isMe = user.user_id === currentUserId;
							const badgeLabel = getBadge(user.rank);
							const badgeColors: { [key: string]: string } = {
								"Expert": "bg-yellow-100 text-yellow-700",
								"Pro": "bg-blue-100 text-blue-700",
								"Intermediate": "bg-gray-200 text-gray-700",
								"Sprout": "bg-green-100 text-green-700"
							};

							return (
								<tr
									key={user.user_id}
									className={`transition-colors ${
										isMe 
											? "bg-emerald-50 hover:bg-emerald-100" 
											: idx % 2 === 0 
											? "bg-white hover:bg-gray-50" 
											: "bg-gray-50 hover:bg-gray-100"
									}`}
								>
									<td className={`px-6 py-4 font-black text-lg ${isMe ? "text-emerald-600" : "text-gray-600"}`}>
										#{user.rank}
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
												{user.intra_name[0]?.toUpperCase()}
											</div>
											<div>
												<div className={`font-semibold ${isMe ? "text-emerald-700 font-black" : "text-gray-900"}`}>
													@{user.intra_name}
												</div>
												{isMe && <div className="text-xs text-emerald-600 font-bold">⭐ That's you!</div>}
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
											<span className={`font-bold text-lg ${isMe ? "text-emerald-600" : "text-gray-900"}`}>
												{user.water_count}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeColors[badgeLabel]}`}>
											{badgeLabel}
										</span>
									</td>
								</tr>
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