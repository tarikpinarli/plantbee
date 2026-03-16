package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"plantbee-backend/internal/models"
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

	if err := h.PlantService.ProcessReading(raw); err != nil {
		fmt.Printf("❌ Processing Error: %v\n", err)
		http.Error(w, "Failed to process reading", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte("Ack")); err != nil {
		fmt.Printf("error writing ack response: %v\n", err)
	}
}
