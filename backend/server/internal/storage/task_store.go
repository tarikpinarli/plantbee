package storage

import (
	"database/sql"
	"errors"

	"plantbee-backend/internal/models"

	"github.com/lib/pq"
)

// ErrTaskAlreadyActive is returned when trying to create a duplicate active task.
var ErrTaskAlreadyActive = errors.New("a task of this type is already active for this plant")

// CreateTask inserts a new task into the database.
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
