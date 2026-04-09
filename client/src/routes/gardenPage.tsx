import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPlants } from '@/api/plants.api'

// Route definition
export const Route = createFileRoute('/gardenPage')({
  component: GardenPage,
})

function GardenPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plants'],
    queryFn: fetchPlants,
  })

  if (isLoading) return <p>Loading...</p>

  if (error) {
    console.error(error)
    return <p>Error loading plants</p>
  }

  if (!data || data.length === 0) return <p>No plants found</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.map((plant) => (
        <div
          key={plant.id}
          className="border p-4 rounded-lg shadow-sm bg-white dark:bg-[#09431c]"
        >
          <h2 className="text-lg font-semibold text-[#13ec5b] dark:text-slate-100">
            {plant.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Species: {plant.species ?? 'Unknown'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Category: {plant.category ?? 'N/A'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Pot Volume: {plant.pot_volume_liters ?? 'N/A'} L
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Light Need: {plant.light_need ?? 'Unknown'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Target Moisture: {plant.target_moisture ?? 'N/A'}%
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sensor ID: {plant.sensor_id ?? 'N/A'}
          </p>
          {plant.image_url && (
            <img
              src={plant.image_url}
              alt={plant.name}
              className="mt-2 w-full h-40 object-cover rounded"
            />
          )}
        </div>
      ))}
    </div>
  )
}