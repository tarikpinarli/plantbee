export const LeaderboardTableHead = () => {
	return (
		<thead className="bg-linear-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
			<tr>
				{['RANK', 'VOLUNTEER', 'TOTAL WATERING', 'BADGE LEVEL'].map((h) => (
					<th 
						key={h} 
						className="px-6 py-4 text-xs font-black text-emerald-700 tracking-widest"
					>
						{h}
					</th>
				))}
				
			</tr>
		</thead>
	);
}

import type { LeaderboardItem } from "@/types/leaderboard.types";

type Props = {
  user: LeaderboardItem;
  index: number;
  isMe: boolean;
};

export const LeaderboardTableRow = ({user, index, isMe}: Props) => {
	const getBadge = (water_count: number) => {
		if (water_count >= 30) return "Pro";
		if (water_count >= 15) return "Intermediate";
		return "Sprout";
	};

	const badgeLabel = getBadge(user.water_count);
	
	return (
		<tr
			key={user.user_id}
			className={`transition-colors ${
				isMe 
					? "bg-emerald-50 hover:bg-emerald-100" 
					: index % 2 === 0 
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
				<span className={`inline-block px-3 py-1 rounded-full text-xs font-bold`}>
					{badgeLabel}
				</span>
			</td>
		</tr>
	);
}