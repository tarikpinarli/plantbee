import type { PlantFormData, PlantPayload } from "@/types/plant.types";

export function buildPlantPayload(form: PlantFormData, imageUrl: string): PlantPayload {
	return {
		name: form.name.trim(),
		species: form.species.trim(),
		category: form.category,
		pot_volume_l: Number(form.pot_volume_l), 
		light_need: form.light_need,
		target_moisture: Number(form.target_moisture),
		sensor_id: form.sensor_id.trim(),
		image_url: imageUrl.trim(),
	};
}