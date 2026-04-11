package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"plantbee-backend/internal/models"
	"plantbee-backend/internal/storage"
)

type SensorService struct {
	db *storage.DB
}

func NewSensorService(db *storage.DB) *SensorService {
	return &SensorService{db: db}
}

// ProcessReading handles the business logic when a new sensor reading arrives.
func (s *SensorService) ProcessReading(raw models.IncomingPayload) error {
	reading := models.SensorReading{
		SensorID:     raw.SensorID,
		Moisture:     raw.Moisture,
		WakeTime:     float64(raw.DurationMs) / 1000.0,
		BatteryLevel: raw.BatteryLevel,
		RecordedAt:   time.Now(),
	}

	// 1. Find the plant associated with this sensor
	var plant *models.Plant
	if s.db != nil {
		var err error
		plant, err = s.db.GetPlantBySensorID(reading.SensorID)
		if err == nil {
			s.evaluateTaskLifecycle(plant, &reading)
			s.evaluateBatteryLifecycle(plant, &reading)
			s.evaluateOfflineLifecycle(plant, &reading)
			s.evaluateSuddenDropLifecycle(plant, &reading)
		} else {
			fmt.Printf("🔍 Unrecognized Sensor ID: %s (or DB Error)\n", reading.SensorID)
			return fmt.Errorf("no plant found matching sensor ID: %s", reading.SensorID)
		}
	}

	// 2. Log the reading
	s.printLog(reading)

	// 3. Persist to Database
	if s.db != nil {
		if err := s.db.SaveSensorReadings(&reading); err != nil {
			return fmt.Errorf("failed to save reading: %w", err)
		}
		// Keep the cached moisture field perfectly up to date on the Plant table
		if plant != nil {
			_ = s.db.UpdatePlantCurrentMoisture(plant.ID, reading.Moisture)
		}
	}

	return nil
}

// evaluateTaskLifecycle implements the 3-step task evaluation algorithm.
func (s *SensorService) evaluateTaskLifecycle(plant *models.Plant, reading *models.SensorReading) {
	waterNeed := s.calculateWaterNeed(plant, reading)

	waterMsg := fmt.Sprintf("Plant is thirsty! Moisture is at %d%% (Target: %d%%). Needs %d ml of water.", reading.Moisture, plant.TargetMoisture, waterNeed)

	// ─── Step 1: Evaluate in_progress task ───
	inProgressTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "water", "in_progress")
	if err != nil {
		fmt.Printf("Failed to fetch in_progress task: %v\n", err)
		return
	}

	if inProgressTask != nil {
		if reading.Moisture >= plant.TargetMoisture {
			// ✅ Volunteer succeeded — complete task and credit them
			if err := s.db.CompleteTaskWithCredit(inProgressTask.ID, inProgressTask.VolenteeID); err != nil {
				fmt.Printf("Failed to complete task %d with credit: %v\n", inProgressTask.ID, err)
			} else {
				fmt.Printf("✅ Task %d completed! Volunteer %d earned +1 water_count\n", inProgressTask.ID, inProgressTask.VolenteeID)
			}
		} else {
			// ❌ Moisture didn't reach target — reopen the task
			if err := s.db.ReopenTask(inProgressTask.ID, waterNeed, reading.Moisture, waterMsg); err != nil {
				fmt.Printf("Failed to reopen task %d: %v\n", inProgressTask.ID, err)
			} else {
				fmt.Printf("🔄 Task %d reopened (moisture %d%% < target %d%%), needs %d ml\n",
					inProgressTask.ID, reading.Moisture, plant.TargetMoisture, waterNeed)
			}
		}
		return // in_progress task handled — don't fall through
	}

	// ─── Step 2: Evaluate open task ───
	openTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "water", "open")
	if err != nil {
		fmt.Printf("Failed to fetch open task: %v\n", err)
		return
	}

	if openTask != nil {
		if reading.Moisture >= plant.TargetMoisture {
			// ✅ Organic recovery — someone watered it manually, auto-close
			if err := s.db.AutoCloseOpenTask(plant.ID, "water"); err != nil {
				fmt.Printf("Failed to auto-close open task: %v\n", err)
			} else {
				fmt.Printf("✅ Open task auto-closed for plant '%s' (organic recovery)\n", plant.Name)
			}
		} else {
			// 📊 Still low — update the water amount so next volunteer has accurate info
			if err := s.db.UpdateOpenTaskWaterAmount(plant.ID, "water", waterNeed, reading.Moisture, waterMsg); err != nil {
				fmt.Printf("Failed to update open task water amount: %v\n", err)
			} else {
				fmt.Printf("📊 Updated open task water amount for plant '%s' to %d ml\n", plant.Name, waterNeed)
			}
		}
		return
	}

	// ─── Step 3: No active task — check if a new task is needed ───
	criticalThreshold := plant.TargetMoisture / 2
	if reading.Moisture < criticalThreshold {
		fmt.Printf("⚠️ ALERT: Plant '%s' moisture (%d%%) is critically low (target: %d%%)\n",
			plant.Name, reading.Moisture, plant.TargetMoisture)

		task := models.Task{
			PlantID:         plant.ID,
			SensorID:        reading.SensorID,
			Type:            "water",
			CurrentMoisture: reading.Moisture,
			WaterAmount:     waterNeed,
			Message:         waterMsg,
			Status:          "open",
			ScheduledAt:     time.Now(),
		}
		if err := s.db.CreateTask(&task); err != nil {
			if errors.Is(err, storage.ErrTaskAlreadyActive) {
				fmt.Printf("⚠️ Task for plant '%s' already active (concurrent creation caught)\n", plant.Name)
			} else {
				fmt.Printf("Failed to create task: %v\n", err)
			}
		} else {
			fmt.Printf("📋 New watering task created for plant '%s' (%d ml needed)\n", plant.Name, waterNeed)
		}
		// TODO: Yutong — notify available volunteers about the new task
	}
}

// calculateWaterNeed computes how many ml of water the plant needs to reach target moisture.
func (s *SensorService) calculateWaterNeed(plant *models.Plant, reading *models.SensorReading) int {
	need := int(plant.PotVolumeLiters * float64(plant.TargetMoisture-reading.Moisture) / 100.0 * 1000)
	if need < 0 {
		return 0
	}
	return need
}

func (s *SensorService) evaluateBatteryLifecycle(plant *models.Plant, reading *models.SensorReading) {
	if reading.BatteryLevel <= 20 {
		// Critical battery
		msg := fmt.Sprintf("ESP32 Battery critically low: %d%%", reading.BatteryLevel)
		task := models.Task{
			PlantID:         plant.ID,
			SensorID:        reading.SensorID,
			Type:            "battery_error",
			CurrentMoisture: reading.Moisture,
			Status:          "open",
			Message:         msg,
			ScheduledAt:     time.Now(),
		}
		if err := s.db.CreateTask(&task); err != nil {
			if errors.Is(err, storage.ErrTaskAlreadyActive) {
				// We already have an active battery error task, just update its message so it stays current
				if updateErr := s.db.UpdateOpenTaskMessage(plant.ID, "battery_error", msg); updateErr != nil {
					fmt.Printf("Failed to update active battery error message: %v\n", updateErr)
				}
			} else {
				fmt.Printf("Failed to create battery error task: %v\n", err)
			}
		} else {
			fmt.Printf("🔋 Created battery error task for plant '%s' (%d%%)\n", plant.Name, reading.BatteryLevel)
		}
	} else {
		// Battery is okay, resolve any open or in_progress battery tasks
		openTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "battery_error", "open")
		if err == nil && openTask != nil {
			if err := s.db.AutoCloseOpenTask(plant.ID, "battery_error"); err != nil {
				fmt.Printf("Failed to auto-close battery error task: %v\n", err)
			} else {
				fmt.Printf("✅ Auto-closed open battery error task for plant '%s' (battery now %d%%)\n", plant.Name, reading.BatteryLevel)
			}
		}

		inProgTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "battery_error", "in_progress")
		if err == nil && inProgTask != nil {
			if err := s.db.CompleteTaskWithCredit(inProgTask.ID, inProgTask.VolenteeID); err != nil {
				fmt.Printf("Failed to complete battery error task with credit: %v\n", err)
			} else {
				fmt.Printf("✅ Auto-completed in-progress battery error task for plant '%s'\n", plant.Name)
			}
		}
	}
}

func (s *SensorService) printLog(t models.SensorReading) {
	barLen := t.Moisture / 10
	if barLen > 10 {
		barLen = 10
	}
	if barLen < 0 {
		barLen = 0
	}
	bar := strings.Repeat("█", barLen) + strings.Repeat("░", 10-barLen)

	fmt.Printf("\n🌿 [%s] [PLANT SERVICE] PACKET: ID=%s | Time=%.2fs | Battery=%d%% | Moisture=%s %d%%\n",
		t.RecordedAt.Format("15:04:05"), t.SensorID, t.WakeTime, t.BatteryLevel, bar, t.Moisture)
}

// StartOfflineMonitor runs a background ticker checking for silent sensors.
func (s *SensorService) StartOfflineMonitor(offlineDuration time.Duration, checkInterval time.Duration) {
	go func() {
		ticker := time.NewTicker(checkInterval)
		defer ticker.Stop()
		for {
			// Do an initial check immediately before starting the tick loop
			s.CheckOffline(offlineDuration)
			<-ticker.C
		}
	}()
}

// CheckOffline exposes the internal check logic.
func (s *SensorService) CheckOffline(offlineDuration time.Duration) {
	if s.db == nil {
		return
	}

	threshold := time.Now().Add(-offlineDuration)
	plants, err := s.db.GetOfflinePlants(threshold)
	if err != nil {
		fmt.Printf("Failed to get offline plants: %v\n", err)
		return
	}

	for _, p := range plants {
		msg := "Sensor has not sent data in over 24 hours. Check battery or WiFi connection."
		task := models.Task{
			PlantID:         p.ID,
			SensorID:        p.SensorID,
			Type:            "offline_error",
			CurrentMoisture: p.CurrentMoisture,
			Status:          "open",
			Message:         msg,
			ScheduledAt:     time.Now(),
		}
		if err := s.db.CreateTask(&task); err != nil {
			if !errors.Is(err, storage.ErrTaskAlreadyActive) {
				fmt.Printf("Failed to create offline error task for plant %d: %v\n", p.ID, err)
			}
		} else {
			fmt.Printf("⚠️ Created offline_error task for plant '%s'\n", p.Name)
		}
	}
}

// evaluateOfflineLifecycle automatically finishes any offline errors since a new reading arrived.
func (s *SensorService) evaluateOfflineLifecycle(plant *models.Plant, reading *models.SensorReading) {
	openTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "offline_error", "open")
	if err == nil && openTask != nil {
		if err := s.db.AutoCloseOpenTask(plant.ID, "offline_error"); err != nil {
			fmt.Printf("Failed to auto-close offline error task: %v\n", err)
		} else {
			fmt.Printf("✅ Auto-closed open offline_error task for plant '%s' (sensor rejoined)\n", plant.Name)
		}
	}

	inProgTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "offline_error", "in_progress")
	if err == nil && inProgTask != nil {
		if err := s.db.CompleteTaskWithCredit(inProgTask.ID, inProgTask.VolenteeID); err != nil {
			fmt.Printf("Failed to complete offline error task with credit: %v\n", err)
		} else {
			fmt.Printf("✅ Auto-completed in-progress offline_error task for plant '%s'\n", plant.Name)
		}
	}
}

// evaluateSuddenDropLifecycle creates anomaly tasks for impossibly fast moisture loss, which denotes hardware tampering.
func (s *SensorService) evaluateSuddenDropLifecycle(plant *models.Plant, reading *models.SensorReading) {
	// Need a baseline to prevent false positives when starting out from 0
	if plant.CurrentMoisture == 0 {
		return
	}

	// Fetch up to the last 15 historical readings so we have a good pool to find 5 valid "drying" patterns
	// Note: recent[0] is the most recent PAST reading (since 'reading' is not saved to DB yet)
	recent, err := s.db.GetRecentSensorReadings(reading.SensorID, 15)
	if err != nil || len(recent) < 2 {
		return
	}

	var dryingDrops []int

	// recent is ordered DESC (recent[0] is newest). 
	// To find drops over time, we compare a newer reading to its immediate older neighbor.
	for i := 0; i < len(recent)-1; i++ {
		newer := recent[i].Moisture
		older := recent[i+1].Moisture
		delta := newer - older

		// Only collect readings where the moisture went DOWN (drying)
		if delta < 0 {
			dryingDrops = append(dryingDrops, delta)
			if len(dryingDrops) == 6 {
				break
			}
		}
	}

	// Calculate the average drop during valid drying periods
	avgDryingDrop := -2 // default to a normal 2% drop if we don't have enough data
	if len(dryingDrops) > 0 {
		sum := 0
		for _, d := range dryingDrops {
			sum += d
		}
		avgDryingDrop = sum / len(dryingDrops)
	}

	// Convert negative drops to positive "magnitudes"
	currentDelta := reading.Moisture - recent[0].Moisture
	avgDropMagnitude := -avgDryingDrop
	currentDropMagnitude := -currentDelta

	// 1. Is the drop magnitude 2x bigger than the average drop magnitude?
	// Example: 2% average drop * 2 = 4% threshold buffer.
	anomalyDropThreshold := int(float64(avgDropMagnitude) * 2)

	// Anomaly: The current drop is way larger than threshold, AND reads as literal thin air.
	if currentDropMagnitude >= anomalyDropThreshold && reading.Moisture <= 10 {
		msg := fmt.Sprintf("Sensor anomaly detected! Moisture dropped severely compared to normal drying rates (Current Drop: %d%%, Avg Drying Rate: %d%%). Sensor reads %d%%, meaning it might be unplugged.", currentDropMagnitude, avgDropMagnitude, reading.Moisture)
		task := models.Task{
			PlantID:         plant.ID,
			SensorID:        reading.SensorID,
			Type:            "sensor_anomaly",
			CurrentMoisture: reading.Moisture,
			Status:          "open",
			Message:         msg,
			ScheduledAt:     time.Now(),
		}
		if err := s.db.CreateTask(&task); err != nil {
			if errors.Is(err, storage.ErrTaskAlreadyActive) {
				if updateErr := s.db.UpdateOpenTaskMessage(plant.ID, "sensor_anomaly", msg); updateErr != nil {
					fmt.Printf("Failed to update active sensor anomaly message: %v\n", updateErr)
				}
			} else {
				fmt.Printf("Failed to create anomaly task: %v\n", err)
			}
		} else {
			fmt.Printf("🚨 Created sensor anomaly task for plant '%s' (Drop: %d%%)\n", plant.Name, currentDelta)
		}
	} else if currentDelta >= 10 {
		// Recovery: Spiked up significantly, it was probably plugged back into soil!
		// Resolve the anomaly task.
		openTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "sensor_anomaly", "open")
		if err == nil && openTask != nil {
			if err := s.db.AutoCloseOpenTask(plant.ID, "sensor_anomaly"); err == nil {
				fmt.Printf("✅ Auto-closed open sensor_anomaly task for plant '%s' (Moisture jumped +%d%%)\n", plant.Name, currentDelta)
			}
		}

		inProgTask, err := s.db.GetTaskForPlantByStatus(plant.ID, "sensor_anomaly", "in_progress")
		if err == nil && inProgTask != nil {
			if err := s.db.CompleteTaskWithCredit(inProgTask.ID, inProgTask.VolenteeID); err == nil {
				fmt.Printf("✅ Auto-completed in-progress sensor_anomaly task for plant '%s' (Moisture jumped +%d%%)\n", plant.Name, currentDelta)
			}
		}
	}
}

