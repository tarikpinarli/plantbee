export type LeaderboardItem = {
  rank: number;
  user_id: number;
  intra_name: string;
  image_url: string;
  water_count: number;
};

export type LeaderboardResponse = {
	rankings: LeaderboardItem[];
};