import type { PlantFormData } from "@/types/plant.types";

export type PlantFormErrors =
  Partial<Record<keyof PlantFormData, string>>;

export function validatePlantForm(form: PlantFormData): PlantFormErrors {
	const newErrors: PlantFormErrors = {};

	if (!form.name.trim()) {
		newErrors.name = 'Plant name is required';
	} else if (form.name.length > 100) {
		newErrors.name = 'Name must be under 100 characters';
	}

	if (form.species && form.species.length > 100) {
		newErrors.species = 'Species name must be under 100 characters';
	}

	if (!form.pot_volume_l || form.pot_volume_l <= 0) {
		newErrors.pot_volume_l = 'Enter a valid positive pot volume';
	}

	if (!form.light_need) {
		newErrors.light_need = 'Select a correct light level';
	}

	if (!form.sensor_id.trim()) {
		newErrors.sensor_id = 'Sensor ID is required';
	} else if (form.sensor_id.length > 50) {
		newErrors.sensor_id = 'Sensor ID must be under 50 characters';
	}

	if (form.target_moisture < 0 || form.target_moisture > 100) {
		newErrors.target_moisture = 'Moisture must be between 0 and 100%';
	}

	if (!form.image && !form.image_url) {
		newErrors.image = 'Image is required';
	} else if (form.image_url && !form.image_url.startsWith('http')) {
		newErrors.image_url = 'Invalid image URL format';
	}
	// Returns true only if no errors found
	return newErrors;
}