package storage

import (
	"database/sql"
	"esp32-server/internal/models"
	"fmt"

	_ "github.com/lib/pq"
)

type DB struct {
	conn *sql.DB
}

// Connect the database
func New(connectionString string) (*DB, error) {
	if connectionString == "" {
		return nil, fmt.Errorf("connection string is empty")
	}

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// AUTO MIGRATION (Creating tables if not existing)
	query := `
	CREATE TABLE IF NOT EXISTS sensor_readings (
		id SERIAL PRIMARY KEY,
		captured_at TIMESTAMP NOT NULL,
		sensor_id VARCHAR(50) NOT NULL,
		moisture_percent INT,
		wake_time_sec FLOAT
	);
	
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		login VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(255) NOT NULL,
		image_url TEXT,
		role VARCHAR(20) DEFAULT 'pending',
		campus_id INT,
		session_token VARCHAR(255),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err = db.Exec(query)
	if err != nil {
		return nil, fmt.Errorf("failed to migrate tables: %v", err)
	}

	return &DB{conn: db}, nil
}

// SENSOR METHODS 

func (d *DB) Save(t models.TelemetryData) error {
	query := `
        INSERT INTO sensor_readings (captured_at, sensor_id, moisture_percent, wake_time_sec) 
        VALUES ($1, $2, $3, $4)`

	_, err := d.conn.Exec(query, t.CapturedAt, t.SensorID, t.MoisturePct, t.WakeTimeSec)
	return err
}

// USER METHODS

// If the user exist then update otherwise create the user.
func (d *DB) UpsertUser(u *models.User) error {
	query := `
		INSERT INTO users (login, email, image_url, campus_id, session_token)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (login) 
		DO UPDATE SET session_token = $5, email = $2, image_url = $3;
	`
	_, err := d.conn.Exec(query, u.Login, u.Email, u.ImageURL, u.CampusID, u.SessionToken)
	return err
}

// Frontend will need the session token to verify that the user is logged in. Browser will pass this via cookies
func (d *DB) GetUserByToken(token string) (*models.User, error) {
	var u models.User
	query := `SELECT id, login, email, image_url, role, campus_id FROM users WHERE session_token = $1`
	err := d.conn.QueryRow(query, token).Scan(&u.ID, &u.Login, &u.Email, &u.ImageURL, &u.Role, &u.CampusID)
	if err != nil {
		return nil, err
	}
	return &u, nil
}