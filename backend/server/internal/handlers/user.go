package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

func (h *Handler) HandleWelcome(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		IntendToHelp bool `json:"intend_to_help"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("HandleWelcome: JSON Decode error: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	log.Printf("HandleWelcome: Updating user %d with intend_to_help = %v", userID, req.IntendToHelp)

	if err := h.DB.CompleteWelcome(userID, req.IntendToHelp); err != nil {
		log.Printf("HandleWelcome: CompleteWelcome error: %v", err)
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(map[string]string{"message": "Welcome flow completed"}); err != nil {
		log.Printf("error encoding welcome response: %v\n", err)
	}
}
