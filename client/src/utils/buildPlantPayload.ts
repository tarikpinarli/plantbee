export function buildPlantPayload(form: any) {
	return {
		name: form.name.trim(),
		species: form.species.trim(),
		category: form.category,
		pot_volume_l: Number(form.pot_volume_l),  // ensure it's a number, not a string
		light_need: form.light_need,
		target_moisture: Number(form.target_moisture),
		sensor_id: form.sensor_id.trim(),
		image_url: form.image_url.trim(),
	};
}