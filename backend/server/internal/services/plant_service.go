package services

import (
	"fmt"
	"strings"
	"time"

	"plantbee-backend/internal/models"
	"plantbee-backend/internal/storage"
)

type PlantService struct {
	db *storage.DB
}

func NewPlantService(db *storage.DB) *PlantService {
	return &PlantService{db: db}
}

// ProcessReading handles the business logic when a new sensor reading arrives.
func (s *PlantService) ProcessReading(raw models.IncomingPayload) error {
	reading := models.SensorReading{
		SensorID:   raw.SensorID,
		Moisture:   raw.Moisture,
		WakeTime:   float64(raw.DurationMs) / 1000.0,
		RecordedAt: time.Now(),
	}

	// 1. Check matching plant and Thresholds
	if s.db != nil {
		plant, err := s.db.GetPlantBySensorID(reading.SensorID)
		if err == nil {
			threshold := plant.TargetMoisture / 2
			if reading.Moisture < threshold {
				fmt.Printf("⚠️ ALERT: Plant '%s' moisture (%d%%) is critically low (target: %d%%)\n", plant.Name, reading.Moisture, plant.TargetMoisture)
				s.triggerLowMoistureProcess(plant, &reading)
			}
		} else {
			fmt.Printf("🔍 Unrecognized Sensor ID: %s (or DB Error)\n", reading.SensorID)
		}
	}

	// 2. Log the reading (Business logic: visualization)
	s.printLog(reading)

	// 3. Persist to Database
	if s.db != nil {
		if err := s.db.SaveSensorReadings(&reading); err != nil {
			return fmt.Errorf("failed to save reading: %w", err)
		}
	}

	return nil
}

func (s *PlantService) printLog(t models.SensorReading) {
	barLen := t.Moisture / 10
	if barLen > 10 {
		barLen = 10
	}
	if barLen < 0 {
		barLen = 0
	}
	bar := strings.Repeat("█", barLen) + strings.Repeat("░", 10-barLen)

	fmt.Printf("\n🌿 [%s] [PLANT SERVICE] PACKET: ID=%s | Time=%.2fs | Moisture=%s %d%%\n",
		t.RecordedAt.Format("15:04:05"), t.SensorID, t.WakeTime, bar, t.Moisture)
}

// triggerLowMoistureProcess isolates the reaction logic when a plant drops below threshold.
func (s *PlantService) triggerLowMoistureProcess(plant *models.Plant, reading *models.SensorReading) {
	// calculate water need from plant.pot_volume_liters and plant.target_moisture. Convert to ml
	waterNeed := int(plant.PotVolumeLiters * float64(plant.TargetMoisture-reading.Moisture) / 100.0 * 1000)
	task := models.Task{
		PlantID:     plant.ID,
		Type:        "water",
		WaterAmount: waterNeed,
		Status:      "open",
		ScheduledAt: time.Now(),
	}
	if err := s.db.CreateTask(&task); err != nil {
		fmt.Printf("Failed to create task: %v\n", err)
	}
	
	// from here Yutong needs to find a way to inform available users about the task
}
