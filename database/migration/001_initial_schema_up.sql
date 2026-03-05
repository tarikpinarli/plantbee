CREATE TABLE plants (
	id					SERIAL			PRIMARY KEY
	, plant_name		TEXT			NOT NULL
	-- , plant_image		
	, entry_date		TIMESTAMP		DEFAULT NOW()
	, plant_location	TEXT			NOT NULL
	, watering_frequency_days	INT		NOT NULL
	, last_watered_day	TIMESTAMP		NOT NULL

);

CREATE TABLE students (
	id					SERIAL			PRIMARY KEY
	, student_name		TEXT			NOT NULL
	, email				TEXT			NOT NULL UNIQUE		
	, active_student	BOOLEAN			NOT NULL DEFAULT FALSE
	, at_campus			TEXT			NOT NULL
	, intend_to_help 	BOOLEAN			NOT NULL DEFAULT FALSE

);

CREATE TABLE assignments (
	id					SERIAL			PRIMARY KEY
	, plant_id			INT	NOT NULL REFERENCES plants(id) ON DELETE CASCADE
	, water_status		BOOLEAN			NOT NULL DEFAULT FALSE	
	, student_id		INT NOT NULL REFERENCES students(id) ON DELETE CASCADE
	, note				TEXT


);