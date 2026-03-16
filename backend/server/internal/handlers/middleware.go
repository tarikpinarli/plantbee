package handlers

import (
	"context"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// contextKey is a custom type for context keys to avoid collisions
type contextKey string

const UserIDKey contextKey = "user_id"

// RequireAuth is middleware that ensures a valid JWT is present in the request cookie.
func (h *Handler) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil {
			jsonError(w, "Unauthorized - Missing token", http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value
		secretKey := []byte(os.Getenv("SESSION_SECRET"))

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure the signing method is what we expect
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			jsonError(w, "Unauthorized - Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			jsonError(w, "Unauthorized - Invalid claims", http.StatusUnauthorized)
			return
		}

		// Get user_id from claims. JWT numbers decode as float64 by default.
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			jsonError(w, "Unauthorized - User ID not found in token", http.StatusUnauthorized)
			return
		}

		userID := int(userIDFloat)

		// Create a new context with the user ID and pass
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
