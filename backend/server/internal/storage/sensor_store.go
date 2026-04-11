package storage

import (
	"plantbee-backend/internal/models"
)

// SaveSensorReadings persists a sensor reading to the database.
func (d *DB) SaveSensorReadings(reading *models.SensorReading) error {
	query := `
		INSERT INTO sensor_readings (sensor_id, moisture, wake_time, battery_level)
		VALUES ($1, $2, $3, $4)
		RETURNING id, recorded_at;
	`
	return d.QueryRow(
		query,
		reading.SensorID,
		reading.Moisture,
		reading.WakeTime,
		reading.BatteryLevel,
	).Scan(&reading.ID, &reading.RecordedAt)
}
