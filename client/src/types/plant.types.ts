// Backend expect JSON
export type PlantFormData = {
  name: string; // Required
  species: string; // Optional
  category: string; // Optional
  pot_volume_l: number; // Required — float
  light_need: string; // Required — 'Low' | 'Medium' | 'High'
  target_moisture: number; // Required — 0 to 100, default 50
  sensor_id: string; // Required
  image_url: string; // Required
  //  Plant, AddPlantPayload, schema
};

export type FetchPlantParams = {
  page: number;
  limit: number;
  sortBy: 'name' | 'current_moisture' | 'target_moisture' | 'light_need';
  order: 'asc' | 'desc';
  query: string;
}

export type Task = {
  task_id: number;
  image_url?: string;
  message: string;
  plant_id: number;
  plant_name: string;
  sensor_id: string;
  volunteer_id: number;
  water_needed_ml: number;
  target_moisture: number;
  current_moisture: number;
  type: "water" | "offline_error";
  status: "open" | "in_progress" | "completed";
  scheduled_at: string;
  completed_at?: string;
};
