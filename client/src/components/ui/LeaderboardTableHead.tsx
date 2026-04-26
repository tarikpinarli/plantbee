import { useTranslation } from "react-i18next";

export const LeaderboardTableHead = () => {
	const { t } = useTranslation();
	const headers = [
		t('leaderboard.headers.rank'),
		t('leaderboard.headers.volunteer'),
		t('leaderboard.headers.drops'),
		t('leaderboard.headers.badge'),
	];
	return (
		<thead className="bg-linear-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
			<tr>
				{headers.map((h, i) => (
					<th
						key={h}
						className={`px-2 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-black text-emerald-700 tracking-widest ${
							i === 3 ? "hidden md:table-cell" : ""
						}`}
					>
						{h}
					</th>
				))}

			</tr>
		</thead>
	);
}
