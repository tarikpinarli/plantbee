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

// GetRecentSensorReadings fetches the last N readings for a given sensor, ordered by most recent first.
func (d *DB) GetRecentSensorReadings(sensorID string, limit int) ([]models.SensorReading, error) {
	query := `
		SELECT id, sensor_id, moisture, wake_time, battery_level, recorded_at
		FROM sensor_readings
		WHERE sensor_id = $1
		ORDER BY recorded_at DESC
		LIMIT $2
	`
	rows, err := d.Query(query, sensorID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var readings []models.SensorReading
	for rows.Next() {
		var r models.SensorReading
		if err := rows.Scan(&r.ID, &r.SensorID, &r.Moisture, &r.WakeTime, &r.BatteryLevel, &r.RecordedAt); err != nil {
			return nil, err
		}
		readings = append(readings, r)
	}
	
	if err := rows.Err(); err != nil {
		return nil, err
	}
	
	return readings, nil
}
