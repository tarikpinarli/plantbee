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
