package models

import "time"

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
