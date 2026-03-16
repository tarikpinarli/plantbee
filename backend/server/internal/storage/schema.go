package storage

import "log"

func (d *DB) CreateTables() error {
	const createUsersTable = `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		intra_id VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		login VARCHAR(50) NOT NULL,
		image_url TEXT,
		intend_to_help BOOLEAN DEFAULT FALSE,
		first_visit BOOLEAN DEFAULT TRUE,
		water_count INT DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`

	const createSensorTable = `
	CREATE TABLE IF NOT EXISTS sensor_readings (
		id SERIAL PRIMARY KEY,
		sensor_id VARCHAR(50) NOT NULL,
		moisture INTEGER,
		wake_time FLOAT,
		recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`

	const createPlantTable = `
	CREATE TABLE IF NOT EXISTS plants (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		species VARCHAR(100),
		category VARCHAR(50),
		pot_volume_liters FLOAT,
		light_need VARCHAR(50),
		target_moisture INTEGER DEFAULT 50,
		current_moisture INTEGER DEFAULT 50,
		owner_id INTEGER REFERENCES users(id),
		sensor_id VARCHAR(50) UNIQUE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		image_url TEXT
	);`

	const createTasksTable = `
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		plant_id INTEGER REFERENCES plants(id),
		type VARCHAR(50) NOT NULL,
		water_amount INTEGER,
		status VARCHAR(50) NOT NULL,
		volentee_id INTEGER REFERENCES users(id),
		scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		completed_at TIMESTAMP WITH TIME ZONE
	);`

	if _, err := d.Exec(createUsersTable); err != nil {
		return err
	}
	log.Println("✅ Users table ensured")

	if _, err := d.Exec(createSensorTable); err != nil {
		return err
	}
	log.Println("✅ Sensor readings table ensured")

	if _, err := d.Exec(createPlantTable); err != nil {
		return err
	}
	log.Println("✅ Plant table ensured")

	if _, err := d.Exec(createTasksTable); err != nil {
		return err
	}
	log.Println("✅ Tasks table ensured")

	return nil
}
