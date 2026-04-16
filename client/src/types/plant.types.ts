// Backend expect JSON
export type PlantFormData = {
  name: string; // Required
  species: string; // Optional
  category: string; // Optional
  pot_volume_l: number; // Required — float
  light_need: string; // Required — 'Low' | 'Medium' | 'High'
  target_moisture: number; // Required — 0 to 100, default 50
  sensor_id: string; // Required
  image_url: string; // Required -> not required
  //  Plant, AddPlantPayload, schema
};

export type Task = {
  task_id: number;
  id: number; // Keep this backward compatible or alias if used in old code
  plant_id: number;
  sensor_id?: string;
  type: string;
  plant_name: string;
  image_url: string;
  status: "open" | "in_progress" | "completed";
  current_moisture: number;
  target_moisture: number;
  water_needed_ml: number;
  message: string;
  volunteer_id: number;
  volunteer_name?: string;
  scheduled_at: string;
  completed_at?: string;
  water_amount?: number; // legacy
};
