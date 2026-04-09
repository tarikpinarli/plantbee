// addPlant, getPlants

// import axios from 'axios'
// import type { AddPlantPayload } from '@/types/plant.types'

// export async function addPlant(payload: AddPlantPayload) {
//   const response = await axios.post('/api/plants/add', payload, {
//     headers: { 'Content-Type': 'application/json' },
//   })
//   return response.data
// }

// export async function getPlants() {
//   const response = await axios.get('/api/plants')
//   return response.data
// }

// validate API response
import { plantsArraySchema } from "../types/plant.schema"

export async function fetchPlants() {
  const res = await fetch("/api/plants")

  if (!res.ok) throw new Error("Failed to fetch")

  const data = await res.json()

  // 🔥 Zod validation happens HERE
  return plantsArraySchema.parse(data)
}