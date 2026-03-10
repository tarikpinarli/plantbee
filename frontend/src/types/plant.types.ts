//  Plant, AddPlantPayload, schema

import { z } from 'zod'

// Zod schema = validation rules
export const addPlantSchema = z.object({
  name:            z.string().min(1, 'Name is required'),
  species:         z.string().optional(),
  category:        z.string().optional(),
  pot_volume_l:    z.coerce.number().positive('Must be > 0'),
  light_need:      z.enum(['Low', 'Medium', 'High']),
  target_moisture: z.coerce.number().int().min(0).max(100).default(50),
  sensor_id:       z.string().min(1, 'Sensor ID is required'),
  image_url:       z.string().url('Must be a valid URL'),
})

// TypeScript type — auto derived, no duplication
export type AddPlantPayload = z.infer<typeof addPlantSchema>