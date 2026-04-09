import z from "zod";
import type { plantSchema } from "@/types/plant.schema";
import type React from "react";

type Plant = z.infer<typeof plantSchema>
type PlantCardProps = Pick<Plant, "id" | "name" | "current_moisture" | "light_need" | "owner_name" | "image_url">

export const PlantCard: React.FC<PlantCardProps> = ({
	// id,
	name,
	current_moisture,
	light_need,
	owner_name,
	image_url
}) => {
	return (
		<div>
			<h3 className="text-xl font-bold mb-1"> {name} </h3>
			
			{owner_name &&
				<p className="material-symbols-outlined text-[16px]">
					Added by {owner_name} 
				</p>
			}

			{current_moisture !== undefined &&
				<p>
					Soil Moisture {current_moisture}	
				</p>
			}

			{light_need && 
				<p>
					{light_need}	
				</p>
			}

			{image_url &&
				<img src={image_url} alt={name}/>
			}
		</div>
	);
};