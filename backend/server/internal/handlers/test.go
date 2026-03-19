package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) HandleTestProxy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"status":         "success",
		"message":        "Hello from the Go Backend! 🐝",
		"timestamp":      time.Now().Format(time.RFC3339),
		"proxy_verified": true,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
