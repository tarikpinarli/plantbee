import type z from "zod";
import { CustomedDropdown } from "./CustomedDropdown";
import { CustomedInput } from "./CustomedInput";
import { CustomedToggle } from "./CustomedToggle";
import type { searchPlantSchema } from "@/types/plant.schema";

type PlantSearch = z.infer<typeof searchPlantSchema>;

type GardenControlsProps = {
	search: PlantSearch;
	setSearch: (updates: Partial<PlantSearch>) => void;
}

export function GardenControls({ search, setSearch }: GardenControlsProps) {
	const { sortBy, order, query } = search;

	return (
		<div className='mb-6 flex flex-wrap justify-begin gap-4'>
			{/* Sorting dropdown */}
			<CustomedDropdown
				label='Sort by'
				value={sortBy}
				options={[
					{ label: "Name", value: "name"},
					{ label: "Current Moisture", value: "current_moisture"},
					{ label: "Target Moisture", value: "target_moisture"},
					{ label: "Light need", value: "light_need"},
				]}
				onChange={(e) => {
					setSearch({ 
						sortBy: e.target.value as PlantSearch["sortBy"]
					})
				}
				}
			></CustomedDropdown>

			{/* Order toggle */}
			<CustomedToggle<"asc" | "desc">
				label="Order"
				className='!border-gray-300 !py-2 !text-sm'
				value={order}
				options={["asc", "desc"] as const}
				onToggle={(val) => setSearch({ order: val})}
				render={(val) => (val === 'asc' ? '↑' : '↓')}
			></CustomedToggle>
		
			{/* Filter */}
			<CustomedInput
				label='Search plant by name'
				className={`!bg-transparent`}
				value={query}
				onChange={(e) => 
					setSearch({ query: e.target.value})
				}
				// placeholder='Search plants by name, etc...'

			></CustomedInput>
		</div>	
	);
}