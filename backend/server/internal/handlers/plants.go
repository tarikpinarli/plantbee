package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"

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

// HandleListPlants returns a JSON array of all plants for the plant list page.
func (h *Handler) HandleListPlants(w http.ResponseWriter, r *http.Request) {
	// New read query param
	sortBy := r.URL.Query().Get("sortBy")
	order := r.URL.Query().Get("order")
	query := strings.ToLower(r.URL.Query().Get("query"))

	// fmt.Println("Sort params:", sortBy, order)

	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if h.DB == nil {
		jsonError(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	plants, err := h.DB.GetAllPlants()
	if err != nil {
		fmt.Printf("❌ Failed to fetch plants: %v\n", err)
		jsonError(w, "Failed to fetch plants", http.StatusInternalServerError)
		return
	}

	// New: filtering
	if query != "" {
		filtered := make([]models.PlantListItem, 0)

		for _, p := range plants {
			name := strings.ToLower(p.Name)

			if strings.Contains(name, query) {
				filtered = append(filtered, p)
			}
		}

		plants = filtered
	}
	// New: Add sort slice
	sort.Slice(plants, func(i, j int) bool {
		switch sortBy {

		case "name":
			a := strings.ToLower(plants[i].Name)
			b := strings.ToLower(plants[j].Name)

			if order == "desc" {
				return a > b
			}
			return a < b

		case "current_moisture":
			if order == "desc" {
				return plants[i].CurrentMoisture > plants[j].CurrentMoisture
			}
			return plants[i].CurrentMoisture < plants[j].CurrentMoisture
		
		case "target_moisture":
			if order == "desc" {
				return plants[i].TargetMoisture > plants[j].TargetMoisture
			}
			return plants[i].TargetMoisture < plants[j].TargetMoisture

		case "light_need":
			lightRank := map[string]int{
				"low":    1,
				"medium": 2,
				"high":   3,
			}

			a := lightRank[strings.ToLower(plants[i].LightRequirement)]
			b := lightRank[strings.ToLower(plants[j].LightRequirement)]

			if order == "desc" {
				return a > b
			}
			return a < b

		default:
			return true
			}
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(plants); err != nil {
		fmt.Printf("error encoding plants response: %v\n", err)
	}
}

// HandleListUserPlants returns a JSON array of plants owned by the authenticated user.
func (h *Handler) HandleListUserPlants(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract user ID from context (provided by RequireAuth middleware)
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		jsonError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if h.DB == nil {
		jsonError(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	plants, err := h.DB.GetPlantsByOwnerID(userID)
	if err != nil {
		fmt.Printf("❌ Failed to fetch user plants: %v\n", err)
		jsonError(w, "Failed to fetch plants", http.StatusInternalServerError)
		return
	}

	// Ensure we return an empty array instead of nil
	if plants == nil {
		plants = []models.Plant{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(plants); err != nil {
		fmt.Printf("error encoding user plants response: %v\n", err)
	}
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

		// If Postgres complains about a duplicate key, we intercept it here
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key value") {
			jsonError(w, "A plant is already assigned to this sensor ID", http.StatusConflict)
			return
		}

		jsonError(w, "Failed to save plant", http.StatusInternalServerError)
		return
	}

	fmt.Printf("🌱 Plant created: id=%d name=%s\n", plant.ID, plant.Name)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(plant); err != nil {
		fmt.Printf("error encoding plant response: %v\n", err)
	}
}

// HandleGetPlantByID returns detailed information for a single plant.
func (h *Handler) HandleGetPlantByID(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if h.DB == nil {
		jsonError(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	// Extract the ID from the URL path
	idStr := r.PathValue("id")
	plantID, err := strconv.Atoi(idStr)
	if err != nil {
		jsonError(w, "Invalid plant ID", http.StatusBadRequest)
		return
	}

	// 1. Fetch the Plant
	plant, err := h.DB.GetPlantByID(plantID)
	if err != nil {
		jsonError(w, "Plant not found", http.StatusNotFound)
		return
	}

	// 2. Fetch the Owner's Name
	var ownerName string
	err = h.DB.QueryRow("SELECT login FROM users WHERE id = $1", plant.OwnerID).Scan(&ownerName)
	if err != nil {
		ownerName = "PlantBee Community"
	}

	// 3. Fetch Recent Readings
	readings, err := h.DB.GetRecentSensorReadings(plant.SensorID, 5)
	if err != nil || readings == nil {
		readings = []models.SensorReading{}
	}

	// 4. NEW: Fetch Active Tasks (Open or In Progress)
	var activeTasks []models.Task
	rows, err := h.DB.Query(`
		SELECT id, type, status, water_amount, COALESCE(message, ''), COALESCE(volentee_id, 0) 
		FROM tasks 
		WHERE plant_id = $1 AND status IN ('open', 'in_progress')
		ORDER BY status DESC
	`, plantID)
	if err == nil {
		defer func() {
			_ = rows.Close()
		}()
		for rows.Next() {
			var t models.Task
			if err := rows.Scan(&t.ID, &t.Type, &t.Status, &t.WaterAmount, &t.Message, &t.VolenteeID); err == nil {
				activeTasks = append(activeTasks, t)
			}
		}
	}
	if activeTasks == nil {
		activeTasks = []models.Task{}
	}

	// 5. Build Final Response
	type PlantDetailResponse struct {
		models.Plant
		OwnerName      string                 `json:"owner_name"`
		RecentReadings []models.SensorReading `json:"recent_readings"`
		ActiveTasks    []models.Task          `json:"active_tasks"` // NEW FIELD
	}

	response := PlantDetailResponse{
		Plant:          *plant,
		OwnerName:      ownerName,
		RecentReadings: readings,
		ActiveTasks:    activeTasks,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("error encoding plant response: %v\n", err)
	}
}
