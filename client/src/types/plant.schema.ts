import { z } from "zod"

export const plantSchema = z.object({
  id: z.number(),
  name: z.string(),
  current_moisture: z.number(),
  light_need: z.string(),
  owner_name: z.string(),
  image_url: z.string(),
  target_moisture: z.number().optional(),
})

export const plantsArraySchema = z.array(plantSchema)