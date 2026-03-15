package handlers

import (
	"encoding/json"
	"plantbee-backend/internal/models"
	"fmt"
	"net/http"
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
	w.Write([]byte("Ack"))
}
