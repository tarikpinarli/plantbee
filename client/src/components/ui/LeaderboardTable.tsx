import type { LeaderboardItem } from "@/types/leaderboard.types"
import { LeaderboardTableHead } from "./LeaderboardTableHead";
import { LeaderboardTableRow } from "./LeaderboardTableRow";
import { useState } from "react";

type TableProps = {
	data: (LeaderboardItem & { isMe?: boolean})[];
}

export const LeaderboardTable = ({data}: TableProps) => {
	
	const [showAll, setShowAll] = useState(false);

	let displayData: typeof data = [];
	if (showAll) 
		displayData = data;
	else {
		const myIndex = data.findIndex((u) => u.isMe);
		
		if (myIndex === -1 || myIndex < 5) {
			displayData = data.slice(0, 5);
		} else {
			displayData = [ ...data.slice(0, 4), data[myIndex]];
		}
	}

	const hasMoreThan5 = data.length > 5;

	return (
		<div className="mt-12">
			{/* Section Header */}
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-2xl font-black text-green-600">Full Rankings</h3>
				{/* <div className="flex gap-2">
					<button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">All Time</button>
					<button className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">This Month</button>
				</div> */}
			</div>

			{/* Table Container */}
			<div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200">
				<table className="w-full text-left">
					{/* Table Head */}
					<LeaderboardTableHead />

					{/* Table Body */}
					<tbody className="divide-y divide-gray-500">
						{displayData.map((userItem, index) => (
							<LeaderboardTableRow 
								key={userItem.user_id}
								user={userItem}
								index={index} //for odd and even coloring
								isMe={userItem.isMe ?? false}
							/>
						))}

						{hasMoreThan5 && (
							<tr>
								<td colSpan={4} className="px-2 py-3 md:px-6 md:py-4 font-black text-base md:text-lg text-center bg-green-100">
									<button 
										className="text-emerald-700 font-bold hover:underline"
										onClick={() => setShowAll((prev) => !prev)}
									>
										{showAll ? "Show less" : "Show all volunteers"}
									</button>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}