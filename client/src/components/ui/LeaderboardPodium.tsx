import type { LeaderboardItem } from "@/types/leaderboard.types"
import { getRankColor } from "@/utils/getRankColor";

type PodiumProps = {
	data: LeaderboardItem[];
};

export function LeaderboardPodium({data}: PodiumProps) {
	const badges = ["Master Gardener", "Green Heart", "Sprout Scout"];
	const badgeColors = ["bg-yellow-300", "bg-gray-300", "bg-orange-300"];

	return (
		<div className="mb-6">

			{/* Podium Grid */}
			<div className="grid grid-cols-3 gap-6">
				{data.map((user, index) => (
					<div
						key={user.user_id}
						className={`relative flex flex-col items-center rounded-5xl overflow-hidden transition-transform duration-300 hover:scale-110 ${
							index === 0 
								? "md:col-span-1 order-2 md:order-2 transform md:scale-105" 
								: index === 1 
								? "order-1" 
								: "order-3"
						}`}
					>
						{/* Card with Border */}
						<div 
							className={`w-full bg-white rounded-2xl p-6 border-3 ${
								index === 0 
									? "border-green-500" 
									: index == 1
									? "border-gray-500"
									: "border-amber-400"
							}`}>

							{/* Avatar Container */}
							<div className="flex justify-center mb-4">
								<div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${badgeColors[index]} shadow-md border-3 border-white`}>
									👤
								</div>
								
								<div className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-emerald-400 rounded-full border-2 border-white text-sm font-bold ${getRankColor(index)} `}> 
									{index + 1}
								</div>
							</div>

							{/* Username */}
							<div className="text-center mb-2">
								<div className="font-bold text-lg text-gray-900">{`@${user.intra_name}`}</div>
								<div className="text-xs font-semibold text-emerald-600">{badges[index]}</div>
							</div>

							{/* Stats Box */}
							<div className={`w-full py-4 px-3 rounded-xl text-center font-black text-lg mb-3 ${
								index === 0 
									? "bg-linear-to-r from-emerald-400 to-emerald-500 text-white shadow-lg" 
									: "bg-gray-100 text-gray-900"
							}`}>
								<div className="text-2xl">{user.water_count}</div>
								<div className="text-xs tracking-wider">TOTAL WATERINGS</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}