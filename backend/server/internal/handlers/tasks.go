package handlers

import (
	"encoding/json"
	"net/http"

	"plantbee-backend/internal/models"
)

func (h *Handler) HandleAcceptTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	task.VolenteeID = userID

	accepted, err := h.TaskService.AcceptTask(&task)
	if err != nil {
		http.Error(w, "Failed to accept task", http.StatusInternalServerError)
		return
	}
	if !accepted {
		http.Error(w, "Task is not available for acceptance (it may already be in progress or completed)", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) HandleCancelTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	task.VolenteeID = userID

	if err := h.TaskService.CancelTask(&task); err != nil {
		http.Error(w, "Failed to cancel task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) HandleGetTasks(w http.ResponseWriter, r *http.Request) {
	statusFilter := r.URL.Query().Get("status")
	if statusFilter == "all" {
		statusFilter = ""
	}

	myTasks := r.URL.Query().Get("my_tasks") == "true"
	var volunteerID int
	if myTasks {
		userID, ok := r.Context().Value(UserIDKey).(int)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		volunteerID = userID
	}

	tasks, err := h.TaskService.GetTasks(statusFilter, volunteerID)
	if err != nil {
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}

	if tasks == nil {
		tasks = []models.TaskDTO{}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(tasks)
}
