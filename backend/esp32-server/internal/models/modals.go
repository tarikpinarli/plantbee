package models

import "time"

// 1. The raw data recieved from esp32
type IncomingPayload struct {
	SensorID   string `json:"sensor_id"`
	Moisture   int    `json:"moisture"`
	DurationMs int    `json:"duration_ms"`
}

// 2. the data that will be saved to DB
type TelemetryData struct {
	CapturedAt  time.Time `json:"captured_at"`
	SensorID    string    `json:"sensor_id"`
	MoisturePct int       `json:"moisture_percent"`
	WakeTimeSec float64   `json:"wake_time_seconds"`
}

type User struct {
	ID           int       `json:"id"`
	Login        string    `json:"login"`
	Email        string    `json:"email"`  
	Role         string    `json:"role"`       
	CampusID     int       `json:"campus_id"`
	SessionToken string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type RoleRequest struct {
	Role string `json:"role"`
}