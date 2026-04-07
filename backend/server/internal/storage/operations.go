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

// GetFirstAvailableVolunteer returns the first user with intend_to_help = true
// ordered by user_id to ensure consistent assignment
func (d *DB) GetFirstAvailableVolunteer() (*models.User, error) {
	query := `SELECT id, intra_id, email, login FROM users WHERE intend_to_help = true ORDER BY id LIMIT 1`
	
	var user models.User
	err := d.QueryRow(query).Scan(&user.ID, &user.IntraID, &user.Email, &user.Login)
	
	return &user, err
}

// GetFirstAvailableUser returns the first user in the system (fallback for assignment)
// This ensures tasks get assigned even if no one has explicitly opted in
func (d *DB) GetFirstAvailableUser() (*models.User, error) {
	query := `SELECT id, intra_id, email, login FROM users ORDER BY id LIMIT 1`
	
	var user models.User
	err := d.QueryRow(query).Scan(&user.ID, &user.IntraID, &user.Email, &user.Login)
	
	return &user, err
}

// AssignTaskToVolunteer updates a task with a volunteer ID and sets its status to 'assigned'
func (d *DB) AssignTaskToVolunteer(taskID int, volunteerID int) error {
	query := `UPDATE tasks SET volentee_id = $1, status = 'assigned' WHERE id = $2`
	_, err := d.Exec(query, volunteerID, taskID)
	return err
}

// GetTasksByUserID returns all tasks assigned to a specific user (volunteer)
func (d *DB) GetTasksByUserID(userID int) ([]models.Task, error) {
	query := `
		SELECT id, plant_id, type, water_amount, status, volentee_id, scheduled_at, completed_at
		FROM tasks
		WHERE volentee_id = $1
		ORDER BY scheduled_at DESC
	`
	rows, err := d.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.PlantID, &task.Type, &task.WaterAmount,
			&task.Status, &task.VolenteeID, &task.ScheduledAt, &task.CompletedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if tasks == nil {
		tasks = []models.Task{}
	}

	return tasks, nil
}

// GetOpenTasks returns all unassigned tasks (open status)
func (d *DB) GetOpenTasks() ([]models.Task, error) {
	query := `
		SELECT id, plant_id, type, water_amount, status, volentee_id, scheduled_at, completed_at
		FROM tasks
		WHERE status = 'open'
		ORDER BY scheduled_at DESC
	`
	rows, err := d.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.PlantID, &task.Type, &task.WaterAmount,
			&task.Status, &task.VolenteeID, &task.ScheduledAt, &task.CompletedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if tasks == nil {
		tasks = []models.Task{}
	}

	return tasks, nil
}
