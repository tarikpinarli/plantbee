export const LeaderboardSkeleton = () => {
	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">

			{/* Podium skeleton */}
			<div className="flex justify-center gap-6">
				{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="w-28 h-32 bg-gray-200 rounded-xl"
				/>
				))}
			</div>

			{/* Table skeleton */}
			<div className="bg-white shadow rounded-xl p-4 space-y-3">
				{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className="h-6 bg-gray-200 rounded" />
				))}
			</div>

		</div>
	);
}