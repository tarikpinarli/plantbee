package models

import "time"

type Task struct {
	ID              int       `json:"id"`               // task id
	PlantID         int       `json:"plant_id"`         // plant id
	SensorID        string    `json:"sensor_id"`        // sensor id
	Type            string    `json:"type"`             // "water" or "battery_error"
	CurrentMoisture int       `json:"current_moisture"` // moisture at the time of task creation/update
	WaterAmount     int       `json:"water_amount"`     // ml
	Message         string    `json:"message"`          // task details or error message
	Status          string    `json:"status"`           // "open", "in_progress", "completed"
	VolenteeID      int       `json:"volentee_id"`      // who is doing the task
	ScheduledAt     time.Time `json:"scheduled_at"`     // when the task was created
	CompletedAt     time.Time `json:"completed_at"`     // when the task was completed
}

type TaskDTO struct {
	TaskID          int        `json:"task_id"`
	PlantID         int        `json:"plant_id"`
	SensorID        string     `json:"sensor_id"`
	Type            string     `json:"type"`
	PlantName       string     `json:"plant_name"`
	ImageURL        string     `json:"image_url"`
	Status          string     `json:"status"`
	CurrentMoisture int        `json:"current_moisture"`
	TargetMoisture  int        `json:"target_moisture"`
	WaterNeededML   int        `json:"water_needed_ml"`
	Message         string     `json:"message"`
	VolunteerID     int        `json:"volunteer_id"`
	VolunteerIntraName string     `json:"volunteer_intra_name"`
	ScheduledAt     time.Time  `json:"scheduled_at"`
	CompletedAt     *time.Time `json:"completed_at"`
}
