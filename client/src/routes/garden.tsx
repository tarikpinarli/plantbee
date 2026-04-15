import { useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPlants } from '@/api/plants.api'
import { PlantCard } from '@/components/ui/PlantCard'
import { PlantDetailsModal } from '@/components/ui/PlantDetailsModal'
import { searchPlantSchema } from '@/types/plant.schema'
import { CustomedDropdown } from '@/components/ui/CustomedDropdown'
import { CustomedToggle } from '@/components/ui/CustomedToggle'
import { CustomedInput } from '@/components/ui/CustomedInput'

export const Route = createFileRoute('/garden')({
  validateSearch: (search) => {
    const searchResult = searchPlantSchema.safeParse(search);
    return searchResult.success ? searchResult.data : searchPlantSchema.parse({});
  }, 
  component: GardenPage,
})

function GardenPage() {
  const {page, limit, sortBy, query } = useSearch({from: '/garden'});
  const order: "asc" | "desc" = useSearch({from: '/garden'}).order;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['plants', {page, limit, sortBy, order, query}],
    queryFn: () => fetchPlants({page, limit, sortBy, order, query}),
  });

  const navigate = useNavigate({from: '/garden'});

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);

  return (
    <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-10 relative">
      <header className="mb-8">
        <h1 className="flex flex-col text-2xl font-bold mb-2 text-green-800">
          My Indoor Jungle
        </h1>

        <p className="text-slate-600 dark:text-slate-500 text-sm">
          Keep track of your leafy friends and their needs.
        </p>
      </header>

      {/* Sorting dropdown */}
      <div className='mb-6 flex flex-wrap justify-begin gap-4'>
        <CustomedDropdown
          label='Sort by'
          value={sortBy}
          options={[
            { label: "Name", value: "name"},
            { label: "Moisture", value: "current_moisture"},
            { label: "Light need", value: "light_need"},
          ]}
          onChange={(e) => {
            navigate({
              search: (prev) => ({
                ...prev,
                sortBy: e.target.value  as "name" | "current_moisture" | "light_need",
              }),
            })
          }}
        ></CustomedDropdown>

        {/* Order toggle */}
        <CustomedToggle<"asc" | "desc">
          label="Order"
          className='!border-gray-300 !py-2 !text-sm'
          value={order}
          options={["asc", "desc"] as const}
          onToggle={(val) => 
            navigate({
              search: (prev) => ({
                ...prev,
                order: val,
              }),
            })
          }
          render={(val) => (val === 'asc' ? '↑' : '↓')}
        ></CustomedToggle>
      
        {/* Filter */}
        <CustomedInput
          label='Filter'
          className={`!bg-transparent`}
          value={query}
          onChange={(e) => 
            navigate({
              search: (prev) => ({
                ...prev,
                query: e.target.value,
                page: 1,
              }),
            })
          }
          placeholder='Search plants by name, etc...'

        ></CustomedInput>

      </div>
      
      {/* Pagination controls */}
      <div>
          <button
            disabled
          ></button>
      </div>

      {isLoading && <p> Loading... </p>}
      {error && <p>Error loading plants</p>}
      {!isLoading && !error && (!data || data.length === 0) && <p>No plants found</p>}

      {!isLoading && !error && data && data.length !== 0 && ( 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {data.map((plant) => (
            <PlantCard
              key={plant.id}
              name={plant.name}
              current_moisture={plant.current_moisture}
              target_moisture={plant.target_moisture} // NEW: Pass the target!
              light_need={plant.light_need}
              owner_name={plant.owner_name}
              image_url={plant.image_url}
              onClick={() => setSelectedPlantId(plant.id)}
            />
          ))}
        </div>
      )}

      {selectedPlantId !== null && (
        <PlantDetailsModal 
          plantId={selectedPlantId} 
          onClose={() => setSelectedPlantId(null)} 
        />
      )}
    </div>
  )
}