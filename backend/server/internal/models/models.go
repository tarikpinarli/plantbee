package models

import "time"

type IncomingPayload struct {
	SensorID   string `json:"sensor_id"`
	Moisture   int    `json:"moisture"`
	DurationMs int    `json:"duration_ms"`
}

type User struct {
	ID        int       `json:"id"`
	IntraID   string    `json:"intra_id"`
	Email     string    `json:"email"`
	Login     string    `json:"login"`
	ImageURL  string    `json:"image_url"`
	IntendToHelp bool   `json:"intend_to_help"`
	CreatedAt time.Time `json:"created_at"`
}

type SensorReading struct {
	ID          int       `json:"id"`
	SensorID    string    `json:"sensor_id"`
	Moisture    int       `json:"moisture"`
	WakeTime    float64   `json:"wake_time"`
	RecordedAt  time.Time `json:"recorded_at"`
}

type Plant struct {
    ID                  int       `json:"id"`
    Name                string    `json:"name"`
    Species             string    `json:"species"`
    Category            string    `json:"category"`
    PotVolumeLiters     float64   `json:"pot_volume_l"`
    LightRequirement    string    `json:"light_need"`
    TargetMoisture      int       `json:"target_moisture"`
	CurrentMoisture		int		  `json:"current_moisture"`
    OwnerID             int       `json:"owner_id"`
    SensorID            string    `json:"sensor_id"`
    CreatedAt           time.Time `json:"created_at"`
	ImageURL			string	  `json:"image_url"`
}