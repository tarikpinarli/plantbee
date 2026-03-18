package storage

import (
	"plantbee-backend/internal/models"
)

// User operations
func (d *DB) UpsertUser(user *models.User) error {
	query := `
		INSERT INTO users (intra_id, email, login, image_url, intend_to_help, first_visit, water_count, logged_in)
		VALUES ($1, $2, $3, $4, $5, $6, $7, true)
		ON CONFLICT (intra_id) DO UPDATE
		SET email = EXCLUDED.email,
			login = EXCLUDED.login,
			image_url = EXCLUDED.image_url,
			logged_in = true
		RETURNING id, intend_to_help, first_visit, water_count;
	`
	return d.QueryRow(
		query,
		user.IntraID,
		user.Email,
		user.Login,
		user.ImageURL,
		user.IntendToHelp,
		user.FirstVisit,
		user.WaterCount,
	).Scan(&user.ID, &user.IntendToHelp, &user.FirstVisit, &user.WaterCount)
}

func (d *DB) CompleteWelcome(userID int, intendToHelp bool) error {
	query := `UPDATE users SET intend_to_help = $1, first_visit = false WHERE id = $2`
	_, err := d.Exec(query, intendToHelp, userID)
	return err
}

func (d *DB) SetUserIntention(userID int, help bool) error {
	query := `UPDATE users SET intend_to_help = $1 WHERE id = $2`
	_, err := d.Exec(query, help, userID)
	return err
}

func (d *DB) IncrementWaterCount(userID int) error {
	query := `UPDATE users SET water_count = water_count + 1 WHERE id = $1`
	_, err := d.Exec(query, userID)
	return err
}

func (d *DB) SetUserLoggedOut(userID int) error {
	query := `UPDATE users SET logged_in = false WHERE id = $1`
	_, err := d.Exec(query, userID)
	return err
}

// Sensor Operations
func (d *DB) SaveSensorReadings(reading *models.SensorReading) error {
	query := `
		INSERT INTO sensor_readings (sensor_id, moisture, wake_time)
		VALUES ($1, $2, $3)
		RETURNING id, recorded_at;
	`
	return d.QueryRow(
		query,
		reading.SensorID,
		reading.Moisture,
		reading.WakeTime,
	).Scan(&reading.ID, &reading.RecordedAt)
}

// Plant Operations
func (d *DB) CreatePlant(plant *models.Plant) error {
	query := `
		INSERT INTO plants (name, species, category, pot_volume_liters, light_need, target_moisture, sensor_id, image_url, owner_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at;
	`
	return d.QueryRow(query,
		plant.Name, plant.Species, plant.Category,
		plant.PotVolumeLiters, plant.LightRequirement,
		plant.TargetMoisture, plant.SensorID, plant.ImageURL, plant.OwnerID,
	).Scan(&plant.ID, &plant.CreatedAt)
}

func (d *DB) GetPlantBySensorID(sensorID string) (*models.Plant, error) {
	query := `SELECT id, name, target_moisture, pot_volume_liters FROM plants WHERE sensor_id = $1`

	var plant models.Plant
	err := d.QueryRow(query, sensorID).Scan(
		&plant.ID,
		&plant.Name,
		&plant.TargetMoisture,
		&plant.PotVolumeLiters,
	)

	return &plant, err
}

func (d *DB) GetPlantByOwnerID(ownerID int) (*models.Plant, error) {
	query := `SELECT id, name, target_moisture FROM plants WHERE owner_id = $1`
	var plant models.Plant
	err := d.QueryRow(query, ownerID).Scan(&plant.ID, &plant.Name, &plant.TargetMoisture)
	return &plant, err
}

// Task Operations
func (d *DB) CreateTask(task *models.Task) error {
	query := `
        INSERT INTO tasks (plant_id, type, water_amount, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `
	// We only insert the fields we know when creating a new task (no volenteer_id) it will be set later
	return d.QueryRow(query,
		task.PlantID,
		task.Type,
		task.WaterAmount,
		task.Status,
		task.ScheduledAt,
	).Scan(&task.ID)
}

func (d *DB) AcceptTask(task *models.Task) error {
	query := `UPDATE tasks SET status = 'accepted', volentee_id = $1 WHERE id = $2`
	_, err := d.Exec(query, task.VolenteeID, task.ID)
	return err
}

func (d *DB) CancelTask(task *models.Task) error {
	query := `UPDATE tasks SET status = 'open' WHERE id = $1 AND volentee_id = $2`
	_, err := d.Exec(query, task.ID, task.VolenteeID)
	return err
}
