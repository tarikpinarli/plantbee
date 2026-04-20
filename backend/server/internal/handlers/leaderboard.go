package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"plantbee-backend/internal/models"
)

func (h *Handler) HandleGetLeaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rankings, err := h.DB.GetLeaderboard()
	if err != nil {
		log.Printf("HandleGetLeaderboard: GetLeaderboard error: %v", err)
		http.Error(w, "Failed to fetch leaderboard", http.StatusInternalServerError)
		return
	}

	resp := models.LeaderboardResponse{
		Rankings: rankings,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("HandleGetLeaderboard: JSON Encode error: %v", err)
	}
}
