package handlers

import (
	"encoding/json"
	"net/http"
	"plantbee-backend/internal/models"
)

func (h *Handler) HandleAcceptTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.TaskService.AcceptTask(&task); err != nil {
		http.Error(w, "Failed to accept task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) HandleCancelTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.TaskService.CancelTask(&task); err != nil {
		http.Error(w, "Failed to cancel task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
