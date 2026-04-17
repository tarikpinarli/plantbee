package storage

import (
	"database/sql"
	"errors"
	"fmt"

	"plantbee-backend/internal/models"

	"github.com/lib/pq"
)

// ErrTaskAlreadyActive is returned when trying to create a duplicate active task.
var ErrTaskAlreadyActive = errors.New("a task of this type is already active for this plant")

// CreateTask inserts a new task into the database.
func (d *DB) CreateTask(task *models.Task) error {
	query := `
        INSERT INTO tasks (plant_id, sensor_id, type, current_moisture, water_amount, message, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
    `
	// We only insert the fields we know when creating a new task (no volenteer_id) it will be set later
	err := d.QueryRow(query,
		task.PlantID,
		task.SensorID,
		task.Type,
		task.CurrentMoisture,
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
	query := `SELECT id, plant_id, COALESCE(sensor_id, ''), type, COALESCE(current_moisture, 0), water_amount, message, status, COALESCE(volentee_id, 0)
		FROM tasks WHERE plant_id = $1 AND type = $2 AND status = $3 LIMIT 1`
	var t models.Task
	err := d.QueryRow(query, plantID, taskType, status).Scan(&t.ID, &t.PlantID, &t.SensorID, &t.Type, &t.CurrentMoisture, &t.WaterAmount, &t.Message, &t.Status, &t.VolenteeID)
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
	defer func() {
		_ = tx.Rollback()
	}()

	if _, err := tx.Exec(`UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`, taskID); err != nil {
		return err
	}
	if _, err := tx.Exec(`UPDATE users SET water_count = water_count + 1 WHERE id = $1`, volunteerID); err != nil {
		return err
	}
	return tx.Commit()
}

// ReopenTask reverts an in_progress task back to open, clears the volunteer, and updates water_amount and current_moisture.
func (d *DB) ReopenTask(taskID, newWaterAmount, currentMoisture int, message string) error {
	query := `UPDATE tasks SET status = 'open', volentee_id = NULL, water_amount = $1, current_moisture = $2, message = $3 WHERE id = $4`
	_, err := d.Exec(query, newWaterAmount, currentMoisture, message, taskID)
	return err
}

// AutoCloseOpenTask completes the single open task (no volunteer to credit).
func (d *DB) AutoCloseOpenTask(plantID int, taskType string) error {
	query := `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE plant_id = $1 AND type = $2 AND status = 'open'`
	_, err := d.Exec(query, plantID, taskType)
	return err
}

// UpdateOpenTaskWaterAmount recalculates the water_amount and current_moisture for open task based on new reading.
func (d *DB) UpdateOpenTaskWaterAmount(plantID int, taskType string, waterAmount int, currentMoisture int, message string) error {
	query := `UPDATE tasks SET water_amount = $1, current_moisture = $2, message = $3 WHERE plant_id = $4 AND type = $5 AND status = 'open'`
	_, err := d.Exec(query, waterAmount, currentMoisture, message, plantID, taskType)
	return err
}

// UpdateOpenTaskMessage updates the message of an open task (e.g. for battery level drops).
func (d *DB) UpdateOpenTaskMessage(plantID int, taskType string, message string) error {
	query := `UPDATE tasks SET message = $1 WHERE plant_id = $2 AND type = $3 AND status = 'open'`
	_, err := d.Exec(query, message, plantID, taskType)
	return err
}

func (d *DB) GetTasks(statusFilter string, volunteerID int) ([]models.TaskDTO, error) {
	query := `
		SELECT
			t.id as task_id,
			p.id as plant_id,
			COALESCE(t.sensor_id, '') as sensor_id,
			t.type,
			p.name as plant_name,
			COALESCE(p.image_url, '') as image_url,
			t.status,
			COALESCE(t.current_moisture, p.current_moisture) as current_moisture,
			p.target_moisture,
			t.water_amount as water_needed_ml,
			COALESCE(t.message, '') as message,
			COALESCE(t.volentee_id, 0) as volunteer_id,
			COALESCE(u.login, '') as volunteer_name,
			t.scheduled_at,
			t.completed_at
		FROM tasks t
		JOIN plants p ON t.plant_id = p.id
		LEFT JOIN users u ON t.volentee_id = u.id
		WHERE 1=1
	`

	var args []interface{}
	if statusFilter != "" && statusFilter != "all" {
		args = append(args, statusFilter)
		query += fmt.Sprintf(" AND t.status = $%d", len(args))
	}
	if volunteerID > 0 {
		args = append(args, volunteerID)
		query += fmt.Sprintf(" AND t.volentee_id = $%d", len(args))
	}

	query += " ORDER BY t.scheduled_at DESC"

	rows, err := d.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = rows.Close()
	}()

	var tasks []models.TaskDTO
	for rows.Next() {
		var dto models.TaskDTO
		var completedAt sql.NullTime
		if err := rows.Scan(
			&dto.TaskID,
			&dto.PlantID,
			&dto.SensorID,
			&dto.Type,
			&dto.PlantName,
			&dto.ImageURL,
			&dto.Status,
			&dto.CurrentMoisture,
			&dto.TargetMoisture,
			&dto.WaterNeededML,
			&dto.Message,
			&dto.VolunteerID,
			&dto.VolunteerName,
			&dto.ScheduledAt,
			&completedAt,
		); err != nil {
			return nil, err
		}
		if completedAt.Valid {
			dto.CompletedAt = &completedAt.Time
		}
		tasks = append(tasks, dto)
	}
	return tasks, nil
}
