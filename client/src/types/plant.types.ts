
export type PlantFormData = {
  name: string; // Required
  species: string; // Optional
  category: string; // Optional
  pot_volume_l: number; // Required — float
  light_need: string; // Required — 'Low' | 'Medium' | 'High'
  target_moisture: number; // Required — 0 to 100, default 50
  sensor_id: string; // Required
  image_url: string; // Optional fallback
  image: File | null; // UI required
};

export type PlantPayload = {
  name: string;
  species: string;
  category: string;
  pot_volume_l: number;
  light_need: string;
  target_moisture: number;
  sensor_id: string;
  image_url: string; //backend required
};

export type FetchPlantParams = {
  // page: number;
  // limit: number;
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
  volunteer_intra_name: string;
  water_needed_ml: number;
  target_moisture: number;
  current_moisture: number;
  type: "water" | "error" | "battery_error" | "sensor_anomaly" | (string & {});
  status: "open" | "in_progress" | "completed";
  scheduled_at: string;
  completed_at: string;
};
