import { useState } from 'react'
import { usePlantApi } from './usePlantApi'
import { validatePlantForm } from '@/utils/validatePlantForm'
import { buildPlantPayload } from '@/utils/buildPlantPayload'

// Backend expect JSON
type PlantFormData = {
  name: string              // Required
  species: string           // Optional
  category: string          // Optional
  pot_volume_l: number      // Required — float
  light_need: string        // Required — 'Low' | 'Medium' | 'High'
  target_moisture: number   // Required — 0 to 100, default 50
  sensor_id: string         // Required
  image_url: string         // Required -> not required
}

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
  })

  // Tracks errors per field - record<> create an object type with these keys, each holding a string, partial <> make all keys optiional
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tracks what's happening with the API call
  const {createPlant, status, apiError} = usePlantApi();

  // Single handler for ALL text/number inputs 
  function handleChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  // ── Submit handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, override?: any) {
    e.preventDefault()   // stop browser page reload

    // validate — stop here if anything is wrong
    const newErrors = validatePlantForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // build the JSON payload
    const payload = {
      ...buildPlantPayload(form),
      ...override,
    };

    // log it so you can see exactly what would be sent
    // console.log('Sending to backend:', JSON.stringify(payload, null, 2))

    const success = await createPlant(payload);

    if (success) {
      setForm({
        name: '', species: '', category: '',
        pot_volume_l: 0, light_need: '',
        target_moisture: 50, sensor_id: '', image_url: '',
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