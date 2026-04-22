import { useState } from 'react'
import { usePlantApi } from './usePlantApi'
import { validatePlantForm, type PlantFormErrors } from '@/utils/validatePlantForm'
import { buildPlantPayload } from '@/utils/buildPlantPayload'
import type { PlantFormData } from '@/types/plant.types'

export function usePlantForm() {
  // form : create state of form, setform update the form state
  const [form, setForm] = useState<PlantFormData>({
    name: '',
    species: '',
    category: '',
    pot_volume_l: 0,
    light_need: '',
    target_moisture: 50,
    sensor_id: '',
    image_url: '',
    image: null as File | null,
  })

  // Tracks errors per field - record<> create an object type with these keys, each holding a string, partial <> make all keys optiional
  const [errors, setErrors] = useState<PlantFormErrors>({});

  // Tracks what's happening with the API call
  const {createPlant, status, apiError} = usePlantApi();

  // Single handler for ALL text/number inputs 
  function handleChange(
    field: keyof PlantFormData, 
    value: string | number | File | null
  ) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as user starts typing
    // setErrors(prev => ({ ...prev, [field]: '' }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field]; // 👈 remove error completely
      return newErrors;
    });
  }

  // ── Submit handler
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>, 
    override?: Partial<PlantFormData>
  ) {
    e.preventDefault()   // stop browser page reload

    // validate — stop here if anything is wrong
    const newErrors = validatePlantForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // build the JSON payload
    const imageUrl = override?.image_url ?? form.image_url;

    const payload = buildPlantPayload(form, imageUrl);
    // const payload = buildPlantPayload{
    //   ...form,
    //   ...override?.image_url ?? form={.image_url},
    // };

    // log it so you can see exactly what would be sent
    // console.log('Sending to backend:', JSON.stringify(payload, null, 2))

    const success = await createPlant(payload);

    if (success) {
      setForm({
        name: '', 
        species: '', 
        category: '',
        pot_volume_l: 0, 
        light_need: '',
        target_moisture: 50, 
        sensor_id: '', 
        image_url: '', 
        image: null,
      });
    }
  }

  return {
    form,
    errors,
    status,
    apiError,
    handleChange,
    handleSubmit,
  };
}