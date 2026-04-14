/** Fetch data from backend, validate the data type at runtime and return data to UI */
import { plantsArraySchema } from "@/types/plant.schema"

export async function fetchPlants() {
  const res = await fetch("/api/plants")

  if (!res.ok) throw new Error("Failed to fetch")

  const data = await res.json()
  // console.log("API response:", data); //debug
  // console.log(data[0]); //debug

  const result = plantsArraySchema.safeParse(data)
  
  // Zod validate data at runtime
  if (!result.success) {
    console.error(result.error)
    throw new Error("Invalid data")
  }

  return result.data

}

export async function fetchPlantById(id: number | string) {
  const res = await fetch(`/api/plants/${id}`) // Make sure this matches your backend endpoint
  
  if (!res.ok) throw new Error("Failed to fetch plant details")
  
  const data = await res.json()
  return data;
}
