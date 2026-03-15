package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"plantbee-backend/internal/models"
)

// addPlantRequest is the expected JSON body for creating a plant.
type addPlantRequest struct {
	Name             string  `json:"name"`
	Species          string  `json:"species"`
	Category         string  `json:"category"`
	PotVolumeLiters  float64 `json:"pot_volume_l"`
	LightRequirement string  `json:"light_need"`
	TargetMoisture   int     `json:"target_moisture"`
	SensorID         string  `json:"sensor_id"`
	ImageURL         string  `json:"image_url"`
}

func (h *Handler) HandleAddPlant(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON body
	var req addPlantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		jsonError(w, "Plant name is required", http.StatusBadRequest)
		return
	}

	if req.SensorID == "" {
		jsonError(w, "Sensor ID is required", http.StatusBadRequest)
		return
	}

	if req.PotVolumeLiters == 0 {
		jsonError(w, "Pot volume is required", http.StatusBadRequest)
		return
	}

	if req.LightRequirement == "" {
		jsonError(w, "Light requirement is required", http.StatusBadRequest)
		return
	}

	if req.TargetMoisture == 0 {
		req.TargetMoisture = 50
	}

	// Extract user ID from context
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		jsonError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if h.DB == nil {
		jsonError(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	plant := &models.Plant{
		Name:             req.Name,
		Species:          req.Species,
		Category:         req.Category,
		PotVolumeLiters:  req.PotVolumeLiters,
		LightRequirement: req.LightRequirement,
		TargetMoisture:   req.TargetMoisture,
		SensorID:         req.SensorID,
		ImageURL:         req.ImageURL,
		OwnerID:          userID,
	}

	if err := h.DB.CreatePlant(plant); err != nil {
		fmt.Printf("❌ Failed to create plant: %v\n", err)
		jsonError(w, "Failed to save plant", http.StatusInternalServerError)
		return
	}

	fmt.Printf("🌱 Plant created: id=%d name=%s\n", plant.ID, plant.Name)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(plant)
}

// jsonError writes a JSON error response with the given message and status code.
func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}
