package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"esp32-server/internal/models"
)

func (h *Handler) IngestData(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var raw models.IncomingPayload
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "Bad JSON", http.StatusBadRequest)
		return
	}

	reading := models.SensorReading{
		SensorID:   raw.SensorID,
		Moisture:   raw.Moisture,
		WakeTime:   float64(raw.DurationMs) / 1000.0, // Ms -> second
		RecordedAt: time.Now(),
	}

	printLog(reading)

	if h.DB != nil {
		if err := h.DB.SaveSensorReadings(&reading); err != nil {
			fmt.Printf("❌ DB Error: %v\n", err)
		} else {
			fmt.Println("💾 Saved to DB")
		}
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte("Ack")); err != nil {
		fmt.Printf("failed to write response: %v\n", err)
	}
}

func printLog(t models.SensorReading) {
	barLen := t.Moisture / 10
	if barLen > 10 {
		barLen = 10
	}
	if barLen < 0 {
		barLen = 0
	}
	bar := strings.Repeat("█", barLen) + strings.Repeat("░", 10-barLen)

	fmt.Printf("\n📦 [%s] PACKET: ID=%s | Time=%.2fs | Moisture=%s %d%%\n",
		t.RecordedAt.Format("15:04:05"), t.SensorID, t.WakeTime, bar, t.Moisture)
}
