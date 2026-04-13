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
		logged_in BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`

	const createSensorTable = `
	CREATE TABLE IF NOT EXISTS sensor_readings (
		id SERIAL PRIMARY KEY,
		sensor_id VARCHAR(50) NOT NULL,
		moisture INTEGER,
		wake_time FLOAT,
		battery_level INTEGER,
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
		owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
		sensor_id VARCHAR(50) UNIQUE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		image_url TEXT
	);`

	const createTasksTable = `
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		plant_id INTEGER REFERENCES plants(id),
		sensor_id VARCHAR(50),
		type VARCHAR(50) NOT NULL,
		current_moisture INTEGER,
		water_amount INTEGER,
		message TEXT,
		status VARCHAR(50) NOT NULL,
		volentee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
		scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		completed_at TIMESTAMP WITH TIME ZONE
	);
	CREATE UNIQUE INDEX IF NOT EXISTS unique_active_task_per_plant_type 
	ON tasks (plant_id, type) 
	WHERE status IN ('open', 'in_progress');`

	const alterUsersTable = `
		ALTER TABLE users 
			ADD COLUMN IF NOT EXISTS intra_id VARCHAR(50),
			ADD COLUMN IF NOT EXISTS email VARCHAR(100),
			ADD COLUMN IF NOT EXISTS login VARCHAR(50),
			ADD COLUMN IF NOT EXISTS image_url TEXT,
			ADD COLUMN IF NOT EXISTS intend_to_help BOOLEAN DEFAULT FALSE,
			ADD COLUMN IF NOT EXISTS first_visit BOOLEAN DEFAULT TRUE,
			ADD COLUMN IF NOT EXISTS water_count INT DEFAULT 0,
			ADD COLUMN IF NOT EXISTS logged_in BOOLEAN DEFAULT FALSE,
			ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
	`

	const alterSensorTable = `
		ALTER TABLE sensor_readings 
			ADD COLUMN IF NOT EXISTS sensor_id VARCHAR(50),
			ADD COLUMN IF NOT EXISTS moisture INTEGER,
			ADD COLUMN IF NOT EXISTS wake_time FLOAT,
			ADD COLUMN IF NOT EXISTS battery_level INTEGER,
			ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
	`

	const alterPlantsTable = `
		ALTER TABLE plants 
			ADD COLUMN IF NOT EXISTS name VARCHAR(100),
			ADD COLUMN IF NOT EXISTS species VARCHAR(100),
			ADD COLUMN IF NOT EXISTS category VARCHAR(50),
			ADD COLUMN IF NOT EXISTS pot_volume_liters FLOAT,
			ADD COLUMN IF NOT EXISTS light_need VARCHAR(50),
			ADD COLUMN IF NOT EXISTS target_moisture INTEGER DEFAULT 50,
			ADD COLUMN IF NOT EXISTS current_moisture INTEGER DEFAULT 50,
			ADD COLUMN IF NOT EXISTS owner_id INTEGER,
			ADD COLUMN IF NOT EXISTS sensor_id VARCHAR(50),
			ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			ADD COLUMN IF NOT EXISTS image_url TEXT;
	`

	const alterTasksTable = `
		ALTER TABLE tasks 
			ADD COLUMN IF NOT EXISTS plant_id INTEGER,
			ADD COLUMN IF NOT EXISTS sensor_id VARCHAR(50),
			ADD COLUMN IF NOT EXISTS type VARCHAR(50),
			ADD COLUMN IF NOT EXISTS current_moisture INTEGER,
			ADD COLUMN IF NOT EXISTS water_amount INTEGER,
			ADD COLUMN IF NOT EXISTS message TEXT,
			ADD COLUMN IF NOT EXISTS status VARCHAR(50),
			ADD COLUMN IF NOT EXISTS volentee_id INTEGER,
			ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
	`

	const updateConstraints = `
		-- Update plants owner_id constraint
		DO $$ 
		BEGIN 
			IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'plants_owner_id_fkey') THEN
				ALTER TABLE plants DROP CONSTRAINT plants_owner_id_fkey;
			END IF;
			ALTER TABLE plants ADD CONSTRAINT plants_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
		END $$;

		-- Update tasks volentee_id constraint
		DO $$ 
		BEGIN 
			IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_volentee_id_fkey') THEN
				ALTER TABLE tasks DROP CONSTRAINT tasks_volentee_id_fkey;
			END IF;
			ALTER TABLE tasks ADD CONSTRAINT tasks_volentee_id_fkey FOREIGN KEY (volentee_id) REFERENCES users(id) ON DELETE SET NULL;
		END $$;
	`

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

	if _, err := d.Exec(alterUsersTable); err != nil {
		return err
	}
	if _, err := d.Exec(alterSensorTable); err != nil {
		return err
	}
	if _, err := d.Exec(alterPlantsTable); err != nil {
		return err
	}
	if _, err := d.Exec(alterTasksTable); err != nil {
		return err
	}
	if _, err := d.Exec(updateConstraints); err != nil {
		return err
	}
	log.Println("✅ Table migrations applied")

	return nil
}
