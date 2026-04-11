package models

import "time"

type IncomingPayload struct {
	SensorID     string `json:"sensor_id"`
	Moisture     int    `json:"moisture"`
	DurationMs   int    `json:"duration_ms"`
	BatteryLevel int    `json:"battery_level"`
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
