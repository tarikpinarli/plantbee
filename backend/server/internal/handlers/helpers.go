package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// jsonError writes a JSON error response with the given message and status code.
func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(map[string]string{"error": message}); err != nil {
		fmt.Printf("error encoding json error response: %v\n", err)
	}
}
