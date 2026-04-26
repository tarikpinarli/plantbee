import type { LeaderboardItem } from "@/types/leaderboard.types";
import { useTranslation } from "react-i18next";

type RowProps = {
  user: LeaderboardItem;
  index: number;
  isMe: boolean;
};

export const LeaderboardTableRow = ({user, index, isMe}: RowProps) => {
	const { t } = useTranslation();
	const getBadge = (water_count: number) => {
		if (water_count >= 30) return t("leaderboard.badges.pro");
		if (water_count >= 15) return t("leaderboard.badges.intermediate");
		return t("leaderboard.badges.sprout");
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
			<td className={`px-2 py-3 md:px-6 md:py-4 font-black text-sm ${isMe ? "text-emerald-700" : "text-gray-700"}`}>
				#{user.rank}
			</td>

			<td className="px-2 py-3 md:px-6 md:py-4">
				<div className="flex items-center gap-2 md:gap-3">
					<div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs md:text-sm overflow-hidden">
						{user.image_url ? (
							<img src={user.image_url} alt={user.intra_name} className="w-full h-full object-cover" />
						) : (
							user.intra_name[0]?.toUpperCase()
						)}
					</div>

					<div className="overflow-hidden">
						<div className={`font-semibold text-sm md:text-base truncate ${isMe ? "text-emerald-700 font-black" : "text-gray-900"}`}>
							@{user.intra_name}
						</div>
						{isMe &&
							<div className="text-[10px] md:text-xs text-emerald-600 font-bold truncate">{t('leaderboard.thatsYou')}</div>}
					</div>
				</div>
			</td>

			<td className="px-2 py-3 md:px-6 md:py-4">
				<span className={`font-bold text-base md:text-lg ${isMe ? "text-emerald-700" : "text-gray-900"}`}>
					💧{user.water_count}
				</span>
			</td>

			<td className="px-2 py-3 md:px-6 md:py-4 hidden md:table-cell">
				<span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${isMe ? "text-emerald-700" : "text-gray-700"}`}>
					{badgeLabel}
				</span>
			</td>
		</tr>
	);
}
