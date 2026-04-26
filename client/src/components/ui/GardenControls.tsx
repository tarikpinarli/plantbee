import type z from "zod";
import { CustomedDropdown } from "./CustomedDropdown";
import { CustomedInput } from "./CustomedInput";
import { CustomedToggle } from "./CustomedToggle";
import type { searchPlantSchema } from "@/types/plant.schema";
import { useTranslation } from "react-i18next";

type PlantSearch = z.infer<typeof searchPlantSchema>;

type GardenControlsProps = {
	search: PlantSearch;
	setSearch: (updates: Partial<PlantSearch>) => void;
}

export function GardenControls({ search, setSearch }: GardenControlsProps) {
	const { sortBy, order, query } = search;
	const { t } = useTranslation();

	return (
		<div className='mb-6 flex flex-wrap justify-begin gap-4'>
			{/* Sorting dropdown */}
			<CustomedDropdown
				label={t('garden.controls.sortBy')}
				value={sortBy}
				options={[
					{ label: t('garden.controls.name'), value: "name"},
					{ label: t('garden.controls.currentMoisture'), value: "current_moisture"},
					{ label: t('garden.controls.targetMoisture'), value: "target_moisture"},
					{ label: t('garden.controls.lightNeed'), value: "light_need"},
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
				label={t('garden.controls.order')}
				className='!border-gray-300 !py-2 !text-sm'
				value={order}
				options={["asc", "desc"] as const}
				onToggle={(val) => setSearch({ order: val})}
				render={(val) => (val === 'asc' ? '↑' : '↓')}
			></CustomedToggle>

			{/* Filter */}
			<CustomedInput
				label={t('garden.controls.search')}
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
