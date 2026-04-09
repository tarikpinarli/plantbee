import z from "zod";
import type { plantSchema } from "@/types/plant.schema";
import type React from "react";
import { LightBadge } from "./LightBadge";

type Plant = z.infer<typeof plantSchema>
type PlantCardProps = Pick<Plant, "name" | "current_moisture" | "light_need" | "owner_name" | "image_url">

export const PlantCard: React.FC<PlantCardProps> = ({
	name,
	current_moisture,
	light_need,
	owner_name,
	image_url
}) => {

	// const [moisture, setMoisture] = useState(current_moisture ?? 0)

	return (
		<article className="flex flex-col bg-accent border border-slate-300 rounded-2xl">
			{/* Image / Placeholder */}
			<div className="relative w-full h-40 rounded-t-2xl overflow-hidden bg-slate-200">
				{image_url ? (
					<img
					src={image_url}
					className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-slate-400">
						🌱
					</div>
				)}

				{light_need && (
					<div  className="absolute top-3 right-3">
						<LightBadge level={light_need}/>
					</div>
				)}
			</div>
			
			{/* Content */}
			<div className="mb-4">
				<h3 
					className="text-2xl text-black font-bold mt-1 ml-4"> 
					{name}
				</h3>
				
				{owner_name &&
					<p className="text-sm text-gray-400 ml-4">
						👨🏻‍💻 Added by {owner_name} 
					</p>
				}
			</div>

			{/* Moisture */}
			{current_moisture !== undefined &&
				<div className="ml-4 mr-4 mb-4 text-sm text-gray-400">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium flex items-center gap-1">
							<span className="text-blue-500 text-[18px]">💧</span>
							Soil Moisture
						</span>

						<span className="text-sm font-bold text-green-500">
							{current_moisture}%
						</span>
					</div>

					{/* Progress bar */}
					<div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
						<div
							className="h-full bg-green-500 rounded-full transition-all duration-500"
							style={{ width: `${current_moisture}%` }}
						/>
					</div>
				</div>
			}

		</article>
	);
};