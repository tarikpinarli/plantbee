import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePlantForm } from '@/hooks/usePlantForm'
import { SharedButton } from '@/components/ui/CustomedButton'
import { CustomedSlider } from '@/components/ui/CustomedSlider'
import { CustomedInput } from '@/components/ui/CustomedInput'
import { CustomedDropdown } from '@/components/ui/CustomedDropdown'
import { useImageDrop } from '@/hooks/useImageDrop'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useEffect, useRef } from 'react'

function AddPlantPage() {
  const { form, errors, status, apiError, handleChange, handleSubmit } = usePlantForm();
  
  const { image, handleDrop, handleChangeImage, handleDragOver } = useImageDrop();
  
  const { upload} = useImageUpload();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmitWithImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageUrl = form.image_url;

    // upload file if exists
    if (image) {
      const uploaded = await upload(image);
      if (!uploaded) return; // stop if failed
      imageUrl = uploaded;
    }

    // submit form
    await handleSubmit(e, { image_url: imageUrl });

    handleChangeImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate({ to: '/gardenPage' });
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-10">
      <h1 className="flex flex-col text-2xl font-bold text-green-800 mb-2">Add a New Plant 🌱</h1>
      <p className="text-gray-500 mb-8">Expand your garden by registering a new plant.</p>

      <form onSubmit={handleSubmitWithImage}>

        {/* Basic information */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-700">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-700">Care & Monitoring</h2>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Light Need — Required */}
            <CustomedDropdown
              label={ <> Light Requirement <span className="text-red-500">*</span> </> }
              value={form.light_need}
              onChange={(e) => handleChange('light_need', e.target.value)}
              options={[
                { label: "Select light level", value: "" },
                { label: "🌙 Low — Shade tolerant", value: "Low" },
                { label: "⛅ Medium — Indirect light", value: "Medium" },
                { label: "☀️ High — Full sun", value: "High" },
              ]}
              error={errors.light_need}
            >
            </CustomedDropdown>
          
            {/* Sensor ID — Required */}
            <CustomedInput
              label={ <> Sensor ID <span className="text-red-500">*</span> </> }
              value={form.sensor_id}
              onChange={e => handleChange('sensor_id', e.target.value)}
              placeholder='e.g. sensor-001'
              error={errors.sensor_id}
            />
          </div>

          {/* Target Moisture — slider */}
          <CustomedSlider
            label={`Target Moisture - ${form.target_moisture}%`}
            value={form.target_moisture}
            onChange={value => handleChange("target_moisture", value)}
          />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0% Dry</span>
              <span>50%</span>
              <span>100% Wet</span>
            </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-700">Plant Visual</h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-5 items-start">

              {/* Drag and drop image */}

              <CustomedInput
                className='w-full md:w-50 h-32 md:h-48 flex flex-col items-center 
                justify-center border-2 border-dashed border-green-200 bg-green-00 
                text-gray-400 rounded-lg cursor-pointer'
                // label='Drag & drop an image or click to upload'
                type='file'
                accept='image/*'
                onChange={handleChangeImage}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                ref={fileInputRef}
              />

              {/* Image URL */} 
              <div>
                <CustomedInput
                  className='text-sm font-medium mb-2'
                  label={ "Image URL" }
                  value={form.image_url}
                  onChange={e => handleChange('image_url', e.target.value)}
                  placeholder='https://example.com/plant.jpg (optional)'
                />
                <p className="text-xs text-gray-500 mt-1 italic">
                  Pro-tip: Use high-quality JPG or PNG images for better identification.
                </p>
              </div>
            </div>
        </div>

        <div className="rounded-xl p-6 flex flex-col gap-5">

          {/* Submit Button */}
          <SharedButton 
            className="flex-1 py-4 rounded-xl bg-primary text-background-dark font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2" 
            type="submit" 
            disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving...' : 'Add Plant 🌿'}
          </SharedButton>

        </div>
      </form>

      {/* Success message */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ Plant added successfully!
        </div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {apiError || 'Something went wrong'}
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/addPlantPage')({
  component: AddPlantPage,
})