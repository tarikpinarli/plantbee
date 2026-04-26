import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePlantForm } from '@/hooks/usePlantForm'
import { SharedButton } from '@/components/ui/CustomedButton'
import { CustomedSlider } from '@/components/ui/CustomedSlider'
import { CustomedInput } from '@/components/ui/CustomedInput'
import { CustomedDropdown } from '@/components/ui/CustomedDropdown'
// import { useImageDrop } from '@/hooks/useImageDrop'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useEffect } from 'react'
import { ImageDropZone } from '@/components/ui/ImageDropZone'
import { useTranslation } from 'react-i18next'
// import type { PlantPayload } from '@/types/plant.types'

function AddPlantPage() {
  const { t } = useTranslation();
  const { form, errors, status, apiError, handleChange, handleSubmit } = usePlantForm();
  // const { image, preview, handleDrop, handleChangeImage, handleDragOver } = useImageDrop();
  const { upload} = useImageUpload();
  const handleSubmitWithImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageUrl = form.image_url;

    // upload file if exists
    if (form.image) {
      const uploaded = await upload(form.image);
      if (!uploaded) return; // stop if failed
      imageUrl = uploaded;
    }

    // await handleSubmit(e, payload);
    await handleSubmit(e, { image_url: imageUrl });
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'success') {
      // clear image after success submit only
      // handleChangeImage(null);
      
      const timer = setTimeout(() => {
        navigate({ 
          to: '/garden',
          search: (prev) => ({
            page: 1,
            // limit: prev.limit ?? 6,
            sortBy: prev.sortBy ?? 'name',
            order: prev.order ?? 'asc',
            query: prev.query ?? '',
          }),
        });
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-10">
      <h1 className="flex flex-col text-2xl font-bold text-green-800 mb-2">{t('addPlant.title')}</h1>
      <p className="text-gray-500 mb-8">{t('addPlant.subtitle')}</p>

      <form onSubmit={handleSubmitWithImage}>

        {/* Basic information */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-700">{t('addPlant.basicInfo')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Name — Required */}
          <CustomedInput
            label={ <> {t('addPlant.name')} <span className="text-red-500">*</span> </> }
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder={t('addPlant.namePlaceholder')}
            error={errors.name}
          />

          {/* Species — Optional */}
          <CustomedInput
            label={t('addPlant.species')}
            value={form.species}
            onChange={e => handleChange('species', e.target.value)}
            placeholder={t('addPlant.speciesPlaceholder')}
          />

          {/* Category — Optional */}
          <CustomedDropdown
            label={t('addPlant.category')}
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={[
              { label: t('addPlant.categoryPlaceholder'), value: "" },
              { label: t('addPlant.categories.succulent'), value: "Succulent" },
              { label: t('addPlant.categories.tropical'), value: "Tropical" },
              { label: t('addPlant.categories.herb'), value: "Herb" },
              { label: t('addPlant.categories.fern'), value: "Fern" },
              { label: t('addPlant.categories.cactus'), value: "Cactus" },
              { label: t('addPlant.categories.flowering'), value: "Flowering" },
            ]}
          >
          </CustomedDropdown>

          {/* Pot Volume — Required */}
          <CustomedInput
            label={<>{t('addPlant.potVolume')} <span className="text-red-500">*</span></>}
            type='number'
            step='0.1'
            min='0'
            value={form.pot_volume_l || ''}
            onChange={e => handleChange('pot_volume_l', e.target.value)}
            placeholder={t('addPlant.potVolumePlaceholder')}
            error={errors.pot_volume_l}
          >
          </CustomedInput>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-700">{t('addPlant.careMonitoring')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Light Need — Required */}
            <CustomedDropdown
              label={ <> {t('addPlant.lightRequirement')} <span className="text-red-500">*</span> </> }
              value={form.light_need}
              onChange={(e) => handleChange('light_need', e.target.value)}
              options={[
                { label: t('addPlant.lightLevels.select'), value: "" },
                { label: t('addPlant.lightLevels.low'), value: "Low" },
                { label: t('addPlant.lightLevels.medium'), value: "Medium" },
                { label: t('addPlant.lightLevels.high'), value: "High" },
              ]}
              error={errors.light_need}
            >
            </CustomedDropdown>

            {/* Sensor ID — Required */}
            <CustomedInput
              label={ <> {t('addPlant.sensorId')} <span className="text-red-500">*</span> </> }
              value={form.sensor_id}
              onChange={e => handleChange('sensor_id', e.target.value)}
              placeholder={t('addPlant.sensorIdPlaceholder')}
              error={errors.sensor_id}
            />
          </div>

          {/* Target Moisture — slider */}
          <CustomedSlider
            label={t('addPlant.targetMoisture', { value: form.target_moisture })}
            value={form.target_moisture}
            onChange={value => handleChange("target_moisture", value)}
          />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('addPlant.moistureDry')}</span>
              <span>{t('addPlant.moistureMid')}</span>
              <span>{t('addPlant.moistureWet')}</span>
            </div>

        </div>

        {/* Plant Image */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {t('addPlant.plantVisual')}  <span className="text-red-500">*</span>
          </h2>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr] gap-5 items-start">

              <p className="text-sm text-gray-500 mt-1 italic">
                  {t('addPlant.uploadHint')} <br/>
                  {t('addPlant.uploadFormats')}
              </p>

              <ImageDropZone
                value={form.image}
                onChange={(file) => handleChange("image", file)}
                error={errors.image}
              />

              {/* {errors.image && (
                <span className="text-xs text-red-500">
                  {errors.image}
                </span>
              )} */}

            </div>
        </div>

        <div className="rounded-xl p-6 flex flex-col gap-5">

          {/* Submit Button */}
          <SharedButton
            className="flex-1 py-4 rounded-xl text-background-dark font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
            type="submit"
            disabled={status === 'loading'}>
            {status === 'loading' ? t('addPlant.saving') : t('addPlant.submit')}
          </SharedButton>

        </div>
      </form>

      {/* Success message */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {t('addPlant.success')}
        </div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {apiError || t('addPlant.errorGeneric')}
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/addPlant')({
  component: AddPlantPage,
})