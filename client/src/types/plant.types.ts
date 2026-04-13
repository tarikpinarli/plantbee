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
  id: number;
  plant_id: number;
  type: "water" | "error";
  water_amount?: number;
  status: "open" | "assigned" | "accepted" | "in_progress" | "completed"; // Add 'accepted' here
  volentee_id?: number;
  scheduled_at: string;
  completed_at?: string;
};
