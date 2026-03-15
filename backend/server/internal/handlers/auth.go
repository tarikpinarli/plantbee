package handlers

import (
	"context"
	"encoding/json"
	"plantbee-backend/internal/models"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

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
	defer resp.Body.Close()

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
		http.Redirect(w, r, "/welcome.html", http.StatusTemporaryRedirect)
	} else {
		http.Redirect(w, r, "/dashboard.html", http.StatusTemporaryRedirect)
	}
}

func (h *Handler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	http.Redirect(w, r, "/goodbye.html", http.StatusTemporaryRedirect)
}
