import type { PlantFormData } from "@/types/plant.types";

export type PlantFormErrors =
  Partial<Record<keyof PlantFormData, string>>;

export function validatePlantForm(form: PlantFormData): PlantFormErrors {
	const newErrors: PlantFormErrors = {};

	if (!form.name.trim())
		newErrors.name = 'Plant name is required'

	if (!form.pot_volume_l || form.pot_volume_l <= 0)
		newErrors.pot_volume_l = 'Enter a valid pot volume'

	if (!form.light_need)
		newErrors.light_need = 'Select a correct light level'

	if (!form.sensor_id.trim())
		newErrors.sensor_id = 'Sensor ID is required'

	 if (!form.image && !form.image_url) {
		newErrors.image = 'Image is required'
	}
	// Returns true only if no errors found
	return newErrors;
}