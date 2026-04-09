import { z } from "zod"

export const plantSchema = z.object({
  id: z.number(),
  name: z.string(),
  species: z.string().optional(),
  category: z.string().optional(),
  pot_volume_liters: z.preprocess((val) => {
    if (typeof val === "string") return parseFloat(val)
    return val
  }, z.number().optional()),
  light_need: z.enum(["Low","Medium","High"]).optional(),
  target_moisture: z.number().optional(),
  sensor_id: z.string().optional(),
  image_url: z.string().optional(),
})

export const plantsArraySchema = z.array(plantSchema)