package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type serviceStatus struct {
	API      string `json:"api"`
	Database string `json:"database"`
}

type statusResponse struct {
	Status    string        `json:"status"`
	Services  serviceStatus `json:"services"`
	Timestamp string        `json:"timestamp"`
}

func (h *Handler) HandleStatus(w http.ResponseWriter, r *http.Request) {
	dbStatus := "ok"
	overall := "ok"

	if h.DB == nil {
		dbStatus = "unconfigured"
		overall = "degraded"
	} else {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := h.DB.PingContext(ctx); err != nil {
			dbStatus = "down"
			overall = "down"
		}
	}

	resp := statusResponse{
		Status: overall,
		Services: serviceStatus{
			API:      "ok",
			Database: dbStatus,
		},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	if overall == "down" {
		w.WriteHeader(http.StatusServiceUnavailable)
	}
	_ = json.NewEncoder(w).Encode(resp)
}
