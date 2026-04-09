import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPlants } from '@/api/plants.api'
import { PlantCard } from '@/components/ui/PlantCard'

export const Route = createFileRoute('/gardenPage')({
  component: GardenPage,
})
function GardenPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plants'],
    queryFn: fetchPlants,
  })

  {/* Loading/Error */}
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading plants</p>;

  {/* No plants */}
  if (!data || data.length === 0) return <p>No plants found</p>;

  return (
    <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="flex flex-col text-2xl font-bold mb-2">
          My Indoor Jungle
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Keep track of your leafy friends and their needs.
        </p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((plant) => (
          <PlantCard
            key={plant.id}
            name={plant.name}
            current_moisture={plant.current_moisture}
            light_need={plant.light_need}
            owner_name={plant.owner_name}
            image_url={plant.image_url}
          />
        ))}
      </div>
    </div>
  )
}