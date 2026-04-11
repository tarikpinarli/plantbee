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
