import type z from "zod";
import { PlantCard } from "./PlantCard";
import type { plantsArraySchema } from "@/types/plant.schema";

type GardenList = z.infer<typeof plantsArraySchema>[number];

type GardenGridProps = {
	data: GardenList[];
	onSelect: (id: number) => void;
}

export function GardenGrid({ data, onSelect}: GardenGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
			{data.map((plant) => (
				<PlantCard
					key={plant.id}
					name={plant.name}
					current_moisture={plant.current_moisture}
					target_moisture={plant.target_moisture}
					light_need={plant.light_need}
					owner_name={plant.owner_name}
					image_url={plant.image_url}
					onClick={() => onSelect(plant.id)}
				/>
			))}
		</div>
	);
}