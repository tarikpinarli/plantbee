import type { LeaderboardResponse } from "@/types/leaderboard.types";

export async function fetchLeaderboard() {
	const res = await fetch('/api/leaderboard');

	if (!res.ok) {
		throw new Error('Failed to load leaderboard');
	}

	return res.json() as Promise<LeaderboardResponse>
}