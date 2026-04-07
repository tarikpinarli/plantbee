package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"plantbee-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
)

func (h *Handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	url := h.OAuthConfig.AuthCodeURL("random_state_string")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *Handler) HandleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	token, err := h.OAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		fmt.Printf("❌ Token exchange failed: %v\n", err)
		http.Error(w, "Token exchange failed", http.StatusInternalServerError)
		return
	}

	client := h.OAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.intra.42.fr/v2/me")
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			fmt.Printf("error closing auth response body: %v\n", err)
		}
	}()

	var user42 struct {
		ID    int    `json:"id"`
		Login string `json:"login"`
		Email string `json:"email"`
		Image struct {
			Link string `json:"link"`
		} `json:"image"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&user42); err != nil {
		http.Error(w, "JSON decode failed", http.StatusInternalServerError)
		return
	}

	user := &models.User{
		IntraID:    strconv.Itoa(user42.ID),
		Login:      user42.Login,
		Email:      user42.Email,
		ImageURL:   user42.Image.Link,
		FirstVisit: true,
		CreatedAt:  time.Now(),
	}

	if err := h.DB.UpsertUser(user); err != nil {
		fmt.Printf("DB Error: %v\n", err)
		http.Error(w, "DB Save Error", http.StatusInternalServerError)
		return
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"login":   user.Login,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	secretKey := []byte(os.Getenv("SESSION_SECRET"))
	tokenString, err := jwtToken.SignedString(secretKey)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		Expires:  time.Now().Add(24 * time.Hour),
	})

	if user.FirstVisit {
		http.Redirect(w, r, "/welcome", http.StatusTemporaryRedirect)
	} else {
		http.Redirect(w, r, "/dashboard", http.StatusTemporaryRedirect)
	}
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(os.Getenv("SESSION_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userId := claims["user_id"]
	user, err := h.DB.GetUserByID(int(userId.(float64)))
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *Handler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	if userID, ok := r.Context().Value(UserIDKey).(int); ok {
		if err := h.DB.SetUserLoggedOut(userID); err != nil {
			fmt.Printf("Error setting user logged out: %v\n", err)
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	http.Redirect(w, r, "/goodbye", http.StatusTemporaryRedirect)
}
