package storage

import (
	"database/sql"
	"errors"

	"plantbee-backend/internal/models"
	"github.com/lib/pq"
)

var ErrTaskAlreadyActive = errors.New("a task of this type is already active for this plant")

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

func (d *DB) GetUserByID(userID int) (*models.User, error) {
	query := `SELECT id, email, login, image_url, intend_to_help, first_visit, water_count FROM users WHERE id = $1`
	var user models.User
	err := d.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Login,
		&user.ImageURL,
		&user.IntendToHelp,
		&user.FirstVisit,
		&user.WaterCount,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
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

// GetAllPlants returns all plants with owner names for the plant list page.
func (d *DB) GetAllPlants() ([]models.PlantListItem, error) {
	query := `
		SELECT p.id, p.name, p.light_need, p.target_moisture, p.current_moisture, p.image_url, COALESCE(u.login, '') AS owner_name
		FROM plants p
		LEFT JOIN users u ON p.owner_id = u.id
		ORDER BY p.created_at DESC
	`

	rows, err := d.Query(query)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = rows.Close()
	}()

	var plants []models.PlantListItem
	for rows.Next() {
		var p models.PlantListItem
		if err := rows.Scan(&p.ID, &p.Name, &p.LightRequirement, &p.TargetMoisture, &p.CurrentMoisture, &p.ImageURL, &p.OwnerName); err != nil {
			return nil, err
		}
		plants = append(plants, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Return empty slice instead of nil so JSON encodes as [] not null
	if plants == nil {
		plants = []models.PlantListItem{}
	}

	return plants, nil
}

// Task Operations
func (d *DB) CreateTask(task *models.Task) error {
	query := `
        INSERT INTO tasks (plant_id, type, water_amount, message, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
    `
	// We only insert the fields we know when creating a new task (no volenteer_id) it will be set later
	err := d.QueryRow(query,
		task.PlantID,
		task.Type,
		task.WaterAmount,
		task.Message,
		task.Status,
		task.ScheduledAt,
	).Scan(&task.ID)

	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrTaskAlreadyActive
		}
		return err
	}
	return nil
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

// GetTaskForPlantByStatus fetches the single task matching a specific type and status for a plant.
func (d *DB) GetTaskForPlantByStatus(plantID int, taskType, status string) (*models.Task, error) {
	query := `SELECT id, plant_id, type, water_amount, message, status, COALESCE(volentee_id, 0)
		FROM tasks WHERE plant_id = $1 AND type = $2 AND status = $3 LIMIT 1`
	var t models.Task
	err := d.QueryRow(query, plantID, taskType, status).Scan(&t.ID, &t.PlantID, &t.Type, &t.WaterAmount, &t.Message, &t.Status, &t.VolenteeID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No task found
		}
		return nil, err
	}
	return &t, nil
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

// AutoCloseOpenTask completes the single open task (no volunteer to credit).
func (d *DB) AutoCloseOpenTask(plantID int, taskType string) error {
	query := `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE plant_id = $1 AND type = $2 AND status = 'open'`
	_, err := d.Exec(query, plantID, taskType)
	return err
}

// UpdateOpenTaskWaterAmount recalculates the water_amount for open task based on new reading.
func (d *DB) UpdateOpenTaskWaterAmount(plantID int, taskType string, waterAmount int) error {
	query := `UPDATE tasks SET water_amount = $1 WHERE plant_id = $2 AND type = $3 AND status = 'open'`
	_, err := d.Exec(query, waterAmount, plantID, taskType)
	return err
}

// UpdateOpenTaskMessage updates the message of an open task (e.g. for battery level drops).
func (d *DB) UpdateOpenTaskMessage(plantID int, taskType string, message string) error {
	query := `UPDATE tasks SET message = $1 WHERE plant_id = $2 AND type = $3 AND status = 'open'`
	_, err := d.Exec(query, message, plantID, taskType)
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
			t.water_amount as water_needed_ml,
			COALESCE(t.message, '') as message
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
			&dto.Message,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, dto)
	}
	return tasks, nil
}
