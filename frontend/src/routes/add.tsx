import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/add')({
  component: AddPlantPage,
})

export function addPlantForm() {
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

  // ── Tracks errors per field ──
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
      newErrors.light_need = 'Select a light level'

    if (!form.sensor_id.trim())
      newErrors.sensor_id = 'Sensor ID is required'

    if (!form.image_url.trim())
      newErrors.image_url = 'Image URL is required'

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
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

function AddPlantPage() {
  const { form, errors, status, handleChange, handleSubmit } = addPlantForm()

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 mb-2">Add a New Plant 🌱</h1>
      <p className="text-gray-500 mb-8">Fill in the details below to add a plant to your garden.</p>

      {/* Success message */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ Plant added successfully!
        </div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">

        {/* Name — Required */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Plant Name <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="e.g. Monstera"
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>

        {/* Species — Optional */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Species</label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.species}
            onChange={e => handleChange('species', e.target.value)}
            placeholder="e.g. Monstera deliciosa (optional)"
          />
        </div>

        {/* Category — Optional */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
          >
            <option value="">Select a category (optional)</option>
            <option value="Succulent">Succulent</option>
            <option value="Tropical">Tropical</option>
            <option value="Herb">Herb</option>
            <option value="Fern">Fern</option>
            <option value="Cactus">Cactus</option>
            <option value="Flowering">Flowering</option>
          </select>
        </div>

        {/* Pot Volume — Required */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Pot Volume (Liters) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.pot_volume_l || ''}
            onChange={e => handleChange('pot_volume_l', e.target.value)}
            placeholder="e.g. 2.5"
          />
          {errors.pot_volume_l && <span className="text-xs text-red-500">{errors.pot_volume_l}</span>}
        </div>

        {/* Light Need — Required */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Light Need <span className="text-red-500">*</span>
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.light_need}
            onChange={e => handleChange('light_need', e.target.value)}
          >
            <option value="">Select light level</option>
            <option value="Low">🌑 Low — Shade tolerant</option>
            <option value="Medium">⛅ Medium — Indirect light</option>
            <option value="High">☀️ High — Full sun</option>
          </select>
          {errors.light_need && <span className="text-xs text-red-500">{errors.light_need}</span>}
        </div>

        {/* Target Moisture — slider */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Target Moisture — {form.target_moisture}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            className="accent-green-600"
            value={form.target_moisture}
            onChange={e => handleChange('target_moisture', Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0% Dry</span>
            <span>50%</span>
            <span>100% Wet</span>
          </div>
        </div>

        {/* Sensor ID — Required */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Sensor ID <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.sensor_id}
            onChange={e => handleChange('sensor_id', e.target.value)}
            placeholder="e.g. sensor-001"
          />
          {errors.sensor_id && <span className="text-xs text-red-500">{errors.sensor_id}</span>}
        </div>

        {/* Image URL — Required */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Image URL <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.image_url}
            onChange={e => handleChange('image_url', e.target.value)}
            placeholder="https://example.com/plant.jpg"
          />
          {errors.image_url && <span className="text-xs text-red-500">{errors.image_url}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {status === 'loading' ? 'Saving...' : 'Add Plant 🌿'}
        </button>

      </form>
    </div>
  )
}