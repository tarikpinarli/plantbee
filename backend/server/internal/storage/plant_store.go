package storage

import (
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
