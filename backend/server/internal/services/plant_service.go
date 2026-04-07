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

// CreateAndAssignWateringTask creates a watering task and assigns it to the first available volunteer.
// It returns the task ID if successful, or an error if the process fails.
func (s *PlantService) CreateAndAssignWateringTask(plant *models.Plant, reading *models.SensorReading) error {
	// Calculate water need from plant.pot_volume_liters and plant.target_moisture. Convert to ml
	waterNeed := int(plant.PotVolumeLiters * float64(plant.TargetMoisture-reading.Moisture) / 100.0 * 1000)
	task := models.Task{
		PlantID:     plant.ID,
		Type:        "water",
		WaterAmount: waterNeed,
		Status:      "open",
		ScheduledAt: time.Now(),
	}

	// Create the task in the database
	if err := s.db.CreateTask(&task); err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}

	// Find the first available volunteer (user with intend_to_help = true)
	volunteer, err := s.db.GetFirstAvailableVolunteer()
	if err != nil {
		// Fallback: assign to first available user if no volunteer is found
		volunteer, err = s.db.GetFirstAvailableUser()
		if err != nil {
			fmt.Printf("⚠️ No users available to assign task ID %d: %v\n", task.ID, err)
			return nil
		}
		fmt.Printf("ℹ️ No volunteers found, assigning to first available user '%s'\n", volunteer.Login)
	}

	// Assign the task to the volunteer/user
	if err := s.db.AssignTaskToVolunteer(task.ID, volunteer.ID); err != nil {
		fmt.Printf("Failed to assign task %d to user %d: %v\n", task.ID, volunteer.ID, err)
		return fmt.Errorf("failed to assign task to user: %w", err)
	}

	fmt.Printf("✅ Task ID %d assigned to user '%s' for plant '%s' - Water needed: %d ml\n",
		task.ID, volunteer.Login, plant.Name, waterNeed)

	return nil
}

// triggerLowMoistureProcess isolates the reaction logic when a plant drops below threshold.
func (s *PlantService) triggerLowMoistureProcess(plant *models.Plant, reading *models.SensorReading) {
	if err := s.CreateAndAssignWateringTask(plant, reading); err != nil {
		fmt.Printf("Error in watering task process: %v\n", err)
	}
}
