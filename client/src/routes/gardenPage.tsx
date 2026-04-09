import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPlants } from '@/api/plants.api'

export const Route = createFileRoute('/gardenPage')({
  component: GardenPage,
})

function GardenPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["plants"],
    queryFn: fetchPlants,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading plants</p>

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map((plant) => (
        <div key={plant.id}>
          <h2>{plant.name}</h2>
          <p>{plant.species}</p>
        </div>
      ))}
    </div>
  )
}


