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

	// 1. Find the plant associated with this sensor
	if s.db != nil {
		plant, err := s.db.GetPlantBySensorID(reading.SensorID)
		if err == nil {
			s.evaluateTaskLifecycle(plant, &reading)
		} else {
			fmt.Printf("🔍 Unrecognized Sensor ID: %s (or DB Error)\n", reading.SensorID)
		}
	}

	// 2. Log the reading
	s.printLog(reading)

	// 3. Persist to Database
	if s.db != nil {
		if err := s.db.SaveSensorReadings(&reading); err != nil {
			return fmt.Errorf("failed to save reading: %w", err)
		}
	}

	return nil
}

// evaluateTaskLifecycle implements the 3-step task evaluation algorithm.
func (s *PlantService) evaluateTaskLifecycle(plant *models.Plant, reading *models.SensorReading) {
	waterNeed := s.calculateWaterNeed(plant, reading)

	// ─── Step 1: Evaluate in_progress tasks ───
	inProgressTasks, err := s.db.GetTasksForPlantByStatus(plant.ID, "water", "in_progress")
	if err != nil {
		fmt.Printf("Failed to fetch in_progress tasks: %v\n", err)
		return
	}

	if len(inProgressTasks) > 0 {
		for _, task := range inProgressTasks {
			if reading.Moisture >= plant.TargetMoisture {
				// ✅ Volunteer succeeded — complete task and credit them
				if err := s.db.CompleteTaskWithCredit(task.ID, task.VolenteeID); err != nil {
					fmt.Printf("Failed to complete task %d with credit: %v\n", task.ID, err)
				} else {
					fmt.Printf("✅ Task %d completed! Volunteer %d earned +1 water_count\n", task.ID, task.VolenteeID)
				}
			} else {
				// ❌ Moisture didn't reach target — reopen the task
				if err := s.db.ReopenTask(task.ID, waterNeed); err != nil {
					fmt.Printf("Failed to reopen task %d: %v\n", task.ID, err)
				} else {
					fmt.Printf("🔄 Task %d reopened (moisture %d%% < target %d%%), needs %d ml\n",
						task.ID, reading.Moisture, plant.TargetMoisture, waterNeed)
				}
			}
		}
		return // in_progress tasks handled — don't fall through
	}

	// ─── Step 2: Evaluate open tasks ───
	openTasks, err := s.db.GetTasksForPlantByStatus(plant.ID, "water", "open")
	if err != nil {
		fmt.Printf("Failed to fetch open tasks: %v\n", err)
		return
	}

	if len(openTasks) > 0 {
		if reading.Moisture >= plant.TargetMoisture {
			// ✅ Organic recovery — someone watered it manually, auto-close
			if err := s.db.AutoCloseOpenTasks(plant.ID, "water"); err != nil {
				fmt.Printf("Failed to auto-close open tasks: %v\n", err)
			} else {
				fmt.Printf("✅ Open tasks auto-closed for plant '%s' (organic recovery)\n", plant.Name)
			}
		} else {
			// 📊 Still low — update the water amount so next volunteer has accurate info
			if err := s.db.UpdateOpenTaskWaterAmount(plant.ID, "water", waterNeed); err != nil {
				fmt.Printf("Failed to update open task water amount: %v\n", err)
			} else {
				fmt.Printf("📊 Updated open task water amount for plant '%s' to %d ml\n", plant.Name, waterNeed)
			}
		}
		return
	}

	// ─── Step 3: No active tasks — check if a new task is needed ───
	criticalThreshold := plant.TargetMoisture / 2
	if reading.Moisture < criticalThreshold {
		fmt.Printf("⚠️ ALERT: Plant '%s' moisture (%d%%) is critically low (target: %d%%)\n",
			plant.Name, reading.Moisture, plant.TargetMoisture)

		task := models.Task{
			PlantID:     plant.ID,
			Type:        "water",
			WaterAmount: waterNeed,
			Status:      "open",
			ScheduledAt: time.Now(),
		}
		if err := s.db.CreateTask(&task); err != nil {
			fmt.Printf("Failed to create task: %v\n", err)
		} else {
			fmt.Printf("📋 New watering task created for plant '%s' (%d ml needed)\n", plant.Name, waterNeed)
		}
		// TODO: Yutong — notify available volunteers about the new task
	}
}

// calculateWaterNeed computes how many ml of water the plant needs to reach target moisture.
func (s *PlantService) calculateWaterNeed(plant *models.Plant, reading *models.SensorReading) int {
	return int(plant.PotVolumeLiters * float64(plant.TargetMoisture-reading.Moisture) / 100.0 * 1000)
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
