package models

import "time"

// --- SENSOR DATA ---
type IncomingPayload struct {
	SensorID   string `json:"sensor_id"`
	Moisture   int    `json:"moisture"`
	DurationMs int    `json:"duration_ms"`
}

type TelemetryData struct {
	CapturedAt  time.Time `json:"captured_at"`
	SensorID    string    `json:"sensor_id"`
	MoisturePct int       `json:"moisture_percent"`
	WakeTimeSec float64   `json:"wake_time_seconds"`
}

// --- USER DATA ---
type User struct {
	ID           int       `json:"id"`
	Login        string    `json:"login"`
	Email        string    `json:"email"`
	ImageURL     string    `json:"image_url"`
	Role         string    `json:"role"`
	CampusID     int       `json:"campus_id"`
	SessionToken string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type RoleRequest struct {
	Role string `json:"role"`
}