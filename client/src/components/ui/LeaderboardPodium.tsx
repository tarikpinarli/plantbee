import type { LeaderboardItem } from "@/types/leaderboard.types"

type PodiumProps = {
	data: LeaderboardItem[];
};

export function LeaderboardPodium({data}: PodiumProps) {
	const medals = ["🥇", "🥈", "🥉"];

	return (
		<div className="flex justify-center items-end gap-6">
		{data.map((user, index) => (
			<div
			key={user.user_id}
			className={`
				flex flex-col items-center p-4 rounded-xl shadow-md
				${index === 0 ? "scale-110 bg-yellow-50" : "bg-white"}
			`}
			>
			<div className="text-3xl">{medals[index]}</div>
			<div className="font-bold">{user.intra_name}</div>
			<div className="text-sm text-gray-500">{user.water_count} pts</div>
			</div>
		))}
		</div>
	);
}