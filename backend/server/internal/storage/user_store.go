package storage

import (
	"plantbee-backend/internal/models"
)

// UpsertUser creates a new user or updates an existing one on login.
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

func (d *DB) DeleteUser(userID int) error {
	tx, err := d.Begin()
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback()
	}()

	// 1. Revert in_progress tasks accepted by this user to 'open'
	// This ensures other volunteers can see the task after the user is gone.
	if _, err := tx.Exec(`UPDATE tasks SET status = 'open', volentee_id = NULL WHERE volentee_id = $1 AND status = 'in_progress'`, userID); err != nil {
		return err
	}

	// 2. Delete the user
	// Due to ON DELETE SET NULL on foreign keys:
	// - plants.owner_id will become NULL (Orphaning)
	// - tasks.volentee_id for 'completed' tasks will become NULL (Preserving history)
	if _, err := tx.Exec(`DELETE FROM users WHERE id = $1`, userID); err != nil {
		return err
	}

	return tx.Commit()
}
