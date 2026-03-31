import { createFileRoute } from '@tanstack/react-router'
import { usePlantForm } from '@/hooks/usePlantFormFunc'
import { SharedButton } from '@/components/ui/customedButton'
import { CustomedSlider } from '@/components/ui/customedSlider'
import { CustomedInput } from '@/components/ui/customedInput'
import { CustomedDropdown } from '@/components/ui/customedDropdown'

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
        <CustomedInput
          label={ <> Plant Name <span className="text-red-500">*</span> </> }
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
          placeholder='e.g. Monstera'
          error={errors.name}
        />

        {/* Species — Optional */}
        <CustomedInput
          label={ "Species" }
          value={form.species}
          onChange={e => handleChange('species', e.target.value)}
          placeholder='e.g. Monstera deliciosa (optional)'
        />

        {/* Category — Optional */}
        <CustomedDropdown
          label='Category'
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={[
            { label: "Select a category (optional)", value: "" },
            { label: "Succulent", value: "Succulent" },
            { label: "Tropical", value: "Tropical" },
            { label: "Herb", value: "Herb" },
            { label: "Fern", value: "Fern" },
            { label: "Cactus", value: "Cactus" },
            { label: "Flowering", value: "Flowering" },
          ]}
        >
        </CustomedDropdown>

        {/* Pot Volume — Required */}
        <CustomedInput
          label={<>Pot Volume (Liters) <span className="text-red-500">*</span></>}
          type='number'
          step='0.1'
          min='0'
          value={form.pot_volume_l || ''}
          onChange={e => handleChange('pot_volume_l', e.target.value)}
          placeholder='e.g. 2.5'
          error={errors.pot_volume_l}
        >

        </CustomedInput>

        {/* Light Need — Required */}
        <CustomedDropdown
          label={ <> Light Need <span className="text-red-500">*</span> </> }
          value={form.light_need}
          onChange={(e) => handleChange('light_need', e.target.value)}
          options={[
            { label: "Select light level", value: "" },
            { label: "🌑 Low — Shade tolerant", value: "Low" },
            { label: "⛅ Medium — Indirect light", value: "Medium" },
            { label: "☀️ High — Full sun", value: "High" },
          ]}
          error={errors.light_need}
        >
        </CustomedDropdown>

        {/* Target Moisture — slider */}
        <CustomedSlider
          label={`Target Moisture - ${form.target_moisture}%`}
          value={form.target_moisture}
          onChange={value => handleChange("target_moisture", value)}
        />

        {/* Sensor ID — Required */}
        <CustomedInput
          label={ <> Sensor ID <span className="text-red-500">*</span> </> }
          value={form.sensor_id}
          onChange={e => handleChange('sensor_id', e.target.value)}
          placeholder='e.g. sensor-001'
          error={errors.sensor_id}
        />
        

        {/* Image URL — Required */}
        <CustomedInput
          label={ "Image URL" }
          value={form.image_url}
          onChange={e => handleChange('image_url', e.target.value)}
          placeholder='https://example.com/plant.jpg (optional)'
        />
        



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