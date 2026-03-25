import { useState } from 'react'

// ── This is the exact shape your backend expects ──
// Every field name here must match the backend JSON contract exactly
type PlantFormData = {
  name: string              // Required
  species: string           // Optional
  category: string          // Optional
  pot_volume_l: number      // Required — float
  light_need: string        // Required — 'Low' | 'Medium' | 'High'
  target_moisture: number   // Required — 0 to 100, default 50
  sensor_id: string         // Required
  image_url: string         // Required
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

  // ── Tracks errors per field ── record<> create an object type with these keys, each holding a string, partial <> make all keys optiional
  const [errors, setErrors] = useState<Partial<Record<keyof PlantFormData, string>>>({})

  // ── Tracks what's happening with the API call ──
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // ── Single handler for ALL text/number inputs ──
  // "keyof PlantFormData" means the key must be one of the field names
  function handleChange(field: keyof PlantFormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear the error for this field as soon as user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // ── Validate before sending to backend ──
  function validate(): boolean {
    const newErrors: Partial<Record<keyof PlantFormData, string>> = {}

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

    setErrors(newErrors)

    // Returns true only if no errors found
    return Object.keys(newErrors).length === 0
  }

  // ── Build the exact JSON your backend expects ──
  function buildPayload(): PlantFormData {
    return {
      name: form.name.trim(),
      species: form.species.trim(),
      category: form.category,
      pot_volume_l: Number(form.pot_volume_l),  // ensure it's a number, not a string
      light_need: form.light_need,
      target_moisture: Number(form.target_moisture),
      sensor_id: form.sensor_id.trim(),
      image_url: form.image_url.trim(),
    }
  }

  // ── Submit handler — FormEvent<HTMLFormElement> fixes the deprecation ──
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()   // stop browser page reload

    // Step 1: validate — stop here if anything is wrong
    if (!validate()) return

    // Step 2: build the JSON payload
    const payload = buildPayload()

    // Step 3: log it so you can see exactly what would be sent
    console.log('Sending to backend:', JSON.stringify(payload, null, 2))

    // Step 4: send to backend
    setStatus('loading')
    try {
      const response = await fetch('/api/plants/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),   // ← this converts JS object to JSON string
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error ?? 'Server error')
      }

      // Success — reset form
      setStatus('success')
      setForm({
        name: '', species: '', category: '',
        pot_volume_l: 0, light_need: '',
        target_moisture: 50, sensor_id: '', image_url: '',
      })

    } catch (err) {
      console.error('Failed to add plant:', err)
      setStatus('error')
    }
  }

  return {
    form,
    errors,
    status,
    handleChange,
    handleSubmit,
  }
}