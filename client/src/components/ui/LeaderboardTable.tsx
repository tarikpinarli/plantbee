import type { LeaderboardItem } from "@/types/leaderboard.types"

type TableProps = {
	data: LeaderboardItem[];
	currentUserId?: number;
}

export function LeaderboardTable({data, currentUserId}: TableProps) {
	return (
		<div className="bg-white shadow rounded-xl overflow-hidden">
			<table className="w-full text-left">
				<thead className="bg-gray-100 text-sm text-gray-600">
				<tr>
					<th className="p-3">Rank</th>
					<th>User</th>
					<th>Points</th>
				</tr>
				</thead>

				<tbody>
				{data.map((user) => {
					const isMe = user.user_id === currentUserId;

					return (
					<tr
						key={user.user_id}
						className={`
						border-t text-sm
						${isMe ? "bg-green-50 font-semibold" : ""}
						`}
					>
						<td className="p-3">#{user.rank}</td>
						<td>
						{user.intra_name} {isMe && "⭐ You"}
						</td>
						<td>{user.water_count}</td>
					</tr>
					);
				})}
				</tbody>
			</table>
			</div>
	);
}