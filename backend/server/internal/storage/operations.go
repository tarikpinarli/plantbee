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

func (d *DB) AcceptTask(task *models.Task) (bool, error) {
	query := `UPDATE tasks SET status = 'in_progress', volentee_id = $1 WHERE id = $2 AND status = 'open'`
	res, err := d.Exec(query, task.VolenteeID, task.ID)
	if err != nil {
		return false, err
	}
	rows, _ := res.RowsAffected()
	return rows > 0, nil
}

func (d *DB) CancelTask(task *models.Task) error {
	query := `UPDATE tasks SET status = 'open', volentee_id = NULL, completed_at = NULL WHERE id = $1 AND volentee_id = $2`
	_, err := d.Exec(query, task.ID, task.VolenteeID)
	return err
}

// GetTasksForPlantByStatus fetches tasks matching a specific status for a plant.
func (d *DB) GetTasksForPlantByStatus(plantID int, taskType, status string) ([]models.Task, error) {
	query := `SELECT id, plant_id, type, water_amount, status, COALESCE(volentee_id, 0)
		FROM tasks WHERE plant_id = $1 AND type = $2 AND status = $3`
	rows, err := d.Query(query, plantID, taskType, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		if err := rows.Scan(&t.ID, &t.PlantID, &t.Type, &t.WaterAmount, &t.Status, &t.VolenteeID); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

// CompleteTaskWithCredit atomically marks a task as completed and increments the volunteer's water_count.
func (d *DB) CompleteTaskWithCredit(taskID, volunteerID int) error {
	tx, err := d.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`, taskID); err != nil {
		return err
	}
	if _, err := tx.Exec(`UPDATE users SET water_count = water_count + 1 WHERE id = $1`, volunteerID); err != nil {
		return err
	}
	return tx.Commit()
}

// ReopenTask reverts an in_progress task back to open, clears the volunteer, and updates water_amount.
func (d *DB) ReopenTask(taskID, newWaterAmount int) error {
	query := `UPDATE tasks SET status = 'open', volentee_id = NULL, water_amount = $1 WHERE id = $2`
	_, err := d.Exec(query, newWaterAmount, taskID)
	return err
}

// AutoCloseOpenTasks completes only open tasks (no volunteer to credit).
func (d *DB) AutoCloseOpenTasks(plantID int, taskType string) error {
	query := `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE plant_id = $1 AND type = $2 AND status = 'open'`
	_, err := d.Exec(query, plantID, taskType)
	return err
}

// UpdateOpenTaskWaterAmount recalculates the water_amount for open tasks based on new reading.
func (d *DB) UpdateOpenTaskWaterAmount(plantID int, taskType string, waterAmount int) error {
	query := `UPDATE tasks SET water_amount = $1 WHERE plant_id = $2 AND type = $3 AND status = 'open'`
	_, err := d.Exec(query, waterAmount, plantID, taskType)
	return err
}

func (d *DB) GetTasks(statusFilter string) ([]models.TaskDTO, error) {
	query := `
		SELECT
			t.id as task_id,
			p.id as plant_id,
			t.type,
			p.name as plant_name,
			COALESCE(p.image_url, '') as image_url,
			t.status,
			p.current_moisture,
			p.target_moisture,
			t.water_amount as water_needed_ml
		FROM tasks t
		JOIN plants p ON t.plant_id = p.id
	`

	var args []interface{}
	if statusFilter != "" {
		query += " WHERE t.status = $1"
		args = append(args, statusFilter)
	}

	query += " ORDER BY t.scheduled_at DESC"

	rows, err := d.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.TaskDTO
	for rows.Next() {
		var dto models.TaskDTO
		if err := rows.Scan(
			&dto.TaskID,
			&dto.PlantID,
			&dto.Type,
			&dto.PlantName,
			&dto.ImageURL,
			&dto.Status,
			&dto.CurrentMoisture,
			&dto.TargetMoisture,
			&dto.WaterNeededML,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, dto)
	}
	return tasks, nil
}
