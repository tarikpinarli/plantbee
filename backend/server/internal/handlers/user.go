package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
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

func (h *Handler) HandleUpdateUserRole(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var body struct {
		IntendToHelp bool `json:"intend_to_help"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		log.Printf("HandleUpdateUserRole: JSON Decode error: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	log.Printf("HandleUpdateUserRole: Updating user %d with intend_to_help = %v", userID, body.IntendToHelp)

	if err := h.DB.SetUserIntention(userID, body.IntendToHelp); err != nil {
		log.Printf("HandleUpdateUserRole: SetUserIntention error: %v", err)
		http.Error(w, "Failed to update user role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(map[string]string{"message": "User role updated successfully"}); err != nil {
		log.Printf("error encoding update user role response: %v\n", err)
	}
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if err := h.DB.DeleteUser(userID); err != nil {
		log.Printf("DeleteUser: DeleteUser error: %v", err)
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		Expires:  time.Unix(0, 0),
	})
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(map[string]string{"message": "User has been deleted successfully"}); err != nil {
		log.Printf("error encoding delete user response: %v\n", err)
	}
}