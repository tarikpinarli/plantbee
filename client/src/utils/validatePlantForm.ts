export function validatePlantForm(form: any) {
	const newErrors: Record<string, string> = {};

	if (!form.name.trim())
		newErrors.name = 'Plant name is required'

	if (!form.pot_volume_l || form.pot_volume_l <= 0)
		newErrors.pot_volume_l = 'Enter a valid pot volume'

	if (!form.light_need)
		newErrors.light_need = 'Select a correct light level'

	if (!form.sensor_id.trim())
		newErrors.sensor_id = 'Sensor ID is required'

	// if (!form.image_url.trim())
	//   newErrors.image_url = 'Image URL is required'

	// setErrors(newErrors)

	// Returns true only if no errors found
	return newErrors;
}