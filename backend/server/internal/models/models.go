package models

import "time"

type IncomingPayload struct {
	SensorID     string `json:"sensor_id"`
	Moisture     int    `json:"moisture"`
	DurationMs   int    `json:"duration_ms"`
	BatteryLevel int    `json:"battery_level"`
}

type User struct {
	ID           int       `json:"id"`
	IntraID      string    `json:"intra_id"`
	Email        string    `json:"email"`
	Login        string    `json:"login"`
	ImageURL     string    `json:"image_url"`
	IntendToHelp bool      `json:"intend_to_help"`
	FirstVisit   bool      `json:"first_visit"`
	WaterCount   int       `json:"water_count"`
	CreatedAt    time.Time `json:"created_at"`
}

type SensorReading struct {
	ID           int       `json:"id"`
	SensorID     string    `json:"sensor_id"`
	Moisture     int       `json:"moisture"`
	WakeTime     float64   `json:"wake_time"`
	BatteryLevel int       `json:"battery_level"`
	RecordedAt   time.Time `json:"recorded_at"`
}

type Plant struct {
	ID               int       `json:"id"`
	Name             string    `json:"name"`
	Species          string    `json:"species"`
	Category         string    `json:"category"`
	PotVolumeLiters  float64   `json:"pot_volume_l"`
	LightRequirement string    `json:"light_need"`
	TargetMoisture   int       `json:"target_moisture"`
	CurrentMoisture  int       `json:"current_moisture"`
	OwnerID          int       `json:"owner_id"`
	SensorID         string    `json:"sensor_id"`
	CreatedAt        time.Time `json:"created_at"`
	ImageURL         string    `json:"image_url"`
	LoggedIn         bool      `json:"logged_in"`
}

// PlantListItem is the response DTO for the plant list endpoint.
// Contains only the fields needed for plant cards on the list page.
type PlantListItem struct {
	ID               int    `json:"id"`
	Name             string `json:"name"`
	LightRequirement string `json:"light_need"`
	TargetMoisture   int    `json:"target_moisture"`
	CurrentMoisture  int    `json:"current_moisture"`
	ImageURL         string `json:"image_url"`
	OwnerName        string `json:"owner_name"`
}

type Task struct {
	ID          int       `json:"id"`           // task id
	PlantID     int       `json:"plant_id"`     // plant id
	Type        string    `json:"type"`         // "water" or "battery_error"
	WaterAmount int       `json:"water_amount"` // ml
	Message     string    `json:"message"`      // task details or error message
	Status      string    `json:"status"`       // "open", "in_progress", "completed"
	VolenteeID  int       `json:"volentee_id"`  // who is doing the task
	ScheduledAt time.Time `json:"scheduled_at"` // when the task was created
	CompletedAt time.Time `json:"completed_at"` // when the task was completed
}

type TaskDTO struct {
	TaskID          int    `json:"task_id"`
	PlantID         int    `json:"plant_id"`
	Type            string `json:"type"`
	PlantName       string `json:"plant_name"`
	ImageURL        string `json:"image_url"`
	Status          string `json:"status"`
	CurrentMoisture int    `json:"current_moisture"`
	TargetMoisture  int    `json:"target_moisture"`
	WaterNeededML   int    `json:"water_needed_ml"`
	Message         string `json:"message"`
}
