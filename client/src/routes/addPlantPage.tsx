import { createFileRoute } from '@tanstack/react-router'
import { usePlantForm } from '@/hooks/usePlantFormFunc'
import { SharedButton } from '@/components/ui/customedButton'
import { CustomedSlider } from '@/components/ui/customedSlider'

function AddPlantPage() {
  const { form, errors, status, handleChange, handleSubmit } = usePlantForm()

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
        <CustomedSlider
          label={`Target Moisture - ${form.target_moisture}%`}
          value={form.target_moisture}
          onChange={value => handleChange("target_moisture", value)}
        />

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
        <SharedButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Saving...' : 'Add Plant 🌿'}
        </SharedButton>

      </form>
    </div>
  )
}

export const Route = createFileRoute('/addPlantPage')({
  component: AddPlantPage,
})