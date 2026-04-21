import { useState } from 'react'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPlants } from '@/api/plants.api'
import { PlantDetailsModal } from '@/components/ui/PlantDetailsModal'
import { searchPlantSchema } from '@/types/plant.schema'
import { PaginationButton } from '@/components/ui/Pagination'
import { usePlantSearch } from '@/hooks/usePlantSearch'
import { GardenControls } from '@/components/ui/GardenControls'
import { GardenGrid } from '@/components/ui/GardenGrid'

export const Route = createFileRoute('/garden')({
  validateSearch: (search) => {
    const searchResult = searchPlantSchema.safeParse(search);
    return searchResult.success ? searchResult.data : searchPlantSchema.parse({});
  }, 
  component: GardenPage,
})

function GardenPage() {
  const search = useSearch({from: '/garden'});

  const { setSearch } = usePlantSearch();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['plants', search],
    queryFn: () => fetchPlants(search),
  });

  // console.log("API response:", data);

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);

  return (
    <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-10 relative">
      <header className="mb-8">
        <h1 className="flex flex-col text-2xl font-bold mb-2 text-green-800">
          Hivers' Garden
        </h1>

        <p className="text-slate-600 dark:text-slate-500 text-sm">
          Keep track of your leafy friends and their needs.
        </p>
      </header>

      <GardenControls
        search={search}
        setSearch={setSearch}
      />

      {isLoading && <p> Loading... </p>}
      {error && <p>Error loading plants</p>}
      {!isLoading && !error && (!data || data.length === 0) && <p>No plants found</p>}

      {data && (
        <GardenGrid data={data} onSelect={setSelectedPlantId} />
      )}

      {selectedPlantId && (
        <PlantDetailsModal 
          plantId={selectedPlantId}
          onClose={() => setSelectedPlantId(null)} 
        />
      )}

      {/* Pagination controls */}
      <PaginationButton
        page={search.page}
        onPageChange={(newPage) => setSearch({ page: newPage})}
      ></PaginationButton>

    </div>
  )
}