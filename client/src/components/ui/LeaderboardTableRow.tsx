import type { LeaderboardItem } from "@/types/leaderboard.types";

type RowProps = {
  user: LeaderboardItem;
  index: number;
  isMe: boolean;
};

export const LeaderboardTableRow = ({user, index, isMe}: RowProps) => {
	const getBadge = (water_count: number) => {
		if (water_count >= 30) return "⚡Pro";
		if (water_count >= 15) return "⏱️Intermediate";
		return "🌿Sprout";
	};

	const badgeLabel = getBadge(user.water_count);
	
	return (
		<tr
			// key={user.user_id}
			className={`transition-colors ${
				isMe 
					? "bg-green-300 hover:bg-emerald-100" 
					: index % 2 === 0 
					? "bg-white hover:bg-gray-50" 
					: "bg-gray-100 hover:bg-gray-200"
			}`}
		>
			<td className={`px-6 py-4 font-black text-sm ${isMe ? "text-emerald-700" : "text-gray-700"}`}>
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
						{isMe && 
							<div className="text-xs text-emerald-600 font-bold">⭐ That's you!</div>}
					</div>
				</div>
			</td>

			<td className="px-6 py-4 flex items-center gap-2">
				<span className={`font-bold text-lg ${isMe ? "text-emerald-700" : "text-gray-900"}`}>
					💧{user.water_count}
				</span>
			</td>

			<td className="px-6 py-4">
				<span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${isMe ? "text-emerald-700" : "text-gray-700"}`}>
					{badgeLabel}
				</span>
			</td>
		</tr>
	);
}