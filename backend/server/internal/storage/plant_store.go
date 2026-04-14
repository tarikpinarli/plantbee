package storage

import (
	"time"

	"plantbee-backend/internal/models"
)

// CreatePlant inserts a new plant into the database.
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
	query := `SELECT id, name, target_moisture, pot_volume_liters, COALESCE(current_moisture, 0), sensor_id FROM plants WHERE sensor_id = $1`

	var plant models.Plant
	err := d.QueryRow(query, sensorID).Scan(
		&plant.ID,
		&plant.Name,
		&plant.TargetMoisture,
		&plant.PotVolumeLiters,
		&plant.CurrentMoisture,
		&plant.SensorID,
	)

	return &plant, err
}

func (d *DB) GetPlantByOwnerID(ownerID int) (*models.Plant, error) {
	query := `SELECT id, name, target_moisture FROM plants WHERE owner_id = $1`
	var plant models.Plant
	err := d.QueryRow(query, ownerID).Scan(&plant.ID, &plant.Name, &plant.TargetMoisture)
	return &plant, err
}

func (d *DB) GetPlantsByOwnerID(ownerID int) ([]models.Plant, error) {
	query := `SELECT id, name, COALESCE(species, ''), COALESCE(category, ''), COALESCE(pot_volume_liters, 0), light_need, target_moisture, COALESCE(current_moisture, 0), owner_id, COALESCE(sensor_id, ''), created_at, COALESCE(image_url, '') 
	          FROM plants WHERE owner_id = $1 ORDER BY created_at DESC`

	rows, err := d.Query(query, ownerID)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = rows.Close()
	}()

	var plants []models.Plant
	for rows.Next() {
		var p models.Plant
		err := rows.Scan(
			&p.ID, &p.Name, &p.Species, &p.Category,
			&p.PotVolumeLiters, &p.LightRequirement,
			&p.TargetMoisture, &p.CurrentMoisture,
			&p.OwnerID, &p.SensorID, &p.CreatedAt, &p.ImageURL,
		)
		if err != nil {
			return nil, err
		}
		plants = append(plants, p)
	}
	return plants, nil
}

// GetAllPlants returns all plants with owner names for the plant list page.
func (d *DB) GetAllPlants() ([]models.PlantListItem, error) {
	query := `
		SELECT p.id, p.name, p.light_need, p.target_moisture, COALESCE(p.current_moisture, 0), COALESCE(p.image_url, ''), COALESCE(u.login, 'PlantBee Community') AS owner_name
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

// GetOfflinePlants returns plants that have not received a sensor reading since before the threshold.
func (d *DB) GetOfflinePlants(threshold time.Time) ([]models.Plant, error) {
	query := `
		SELECT p.id, p.name, COALESCE(p.sensor_id, ''), COALESCE(p.current_moisture, 0)
		FROM plants p
		LEFT JOIN (
			SELECT sensor_id, MAX(recorded_at) as last_seen
			FROM sensor_readings
			GROUP BY sensor_id
		) sr ON p.sensor_id = sr.sensor_id
		WHERE (sr.last_seen IS NOT NULL AND sr.last_seen < $1) 
		   OR (sr.last_seen IS NULL AND p.created_at < $1)
	`
	rows, err := d.Query(query, threshold)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = rows.Close()
	}()

	var plants []models.Plant
	for rows.Next() {
		var p models.Plant
		if err := rows.Scan(&p.ID, &p.Name, &p.SensorID, &p.CurrentMoisture); err != nil {
			return nil, err
		}
		plants = append(plants, p)
	}
	return plants, nil
}

// GetPlantByID fetches a single plant's detailed information by its ID.
func (d *DB) GetPlantByID(id int) (*models.Plant, error) {
	// Added COALESCE to safely handle NULL values for deleted users and optional fields!
	query := `
		SELECT 
			id, 
			name, 
			COALESCE(species, ''), 
			COALESCE(category, ''), 
			COALESCE(pot_volume_liters, 0), 
			light_need, 
			target_moisture, 
			COALESCE(current_moisture, 0), 
			COALESCE(owner_id, 0), 
			COALESCE(sensor_id, ''), 
			created_at, 
			COALESCE(image_url, '') 
		FROM plants 
		WHERE id = $1
	`

	var p models.Plant
	err := d.QueryRow(query, id).Scan(
		&p.ID, &p.Name, &p.Species, &p.Category,
		&p.PotVolumeLiters, &p.LightRequirement,
		&p.TargetMoisture, &p.CurrentMoisture,
		&p.OwnerID, &p.SensorID, &p.CreatedAt, &p.ImageURL,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// UpdatePlantCurrentMoisture keeps the plant's current_moisture cached field up to date.
func (d *DB) UpdatePlantCurrentMoisture(plantID int, moisture int) error {
	query := `UPDATE plants SET current_moisture = $1 WHERE id = $2`
	_, err := d.Exec(query, moisture, plantID)
	return err
}
