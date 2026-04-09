
import { z } from "zod"

export const plantSchema = z.object({
  id: z.number(),
  name: z.string(),
  species: z.string().optional(),
  category: z.string().optional(),
  pot_volume_l: z.number(),
  light_need: z.enum(["Low", "Medium", "High"]),
  target_moisture: z.number(),
  sensor_id: z.string(),
  image_url: z.string().optional(),
})

export const plantsArraySchema = z.array(plantSchema)

// auto type
export type Plant = z.infer<typeof plantSchema>