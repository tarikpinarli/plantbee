import { z } from "zod"

export const plantSchema = z.object({
  id: z.number(),
  name: z.string(),
  current_moisture: z.number(),
  light_need: z.string(),
  owner_name: z.string(),
  image_url: z.string(),
  target_moisture: z.number().optional(),
});

export const plantsArraySchema = z.array(plantSchema);

export const searchPlantSchema = z.object ({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(6),
  
  sortBy: z.enum(['name' , 'current_moisture' , 'light_need']).default('name'),
  order: z.enum(['asc' , 'desc']).default('asc'),
  
  query: z.string().default(''),
});