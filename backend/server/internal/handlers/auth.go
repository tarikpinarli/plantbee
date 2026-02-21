package handlers

import (
	"context"
	"encoding/json"
	"esp32-server/internal/models"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

func (h *Handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	url := h.OAuthConfig.AuthCodeURL("random_state_string")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *Handler) HandleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	token, err := h.OAuthConfig.Exchange(context.Background(), code)
	if err != nil {
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
		IntraID:   strconv.Itoa(user42.ID),
		Login:     user42.Login,
		Email:     user42.Email,
		ImageURL:  user42.Image.Link,
		CreatedAt: time.Now(),
	}

	if err := h.DB.UpsertUser(user); err != nil {
		fmt.Printf("DB Error: %v\n", err)
		http.Error(w, "DB Save Error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_user",
		Value:    user.Login,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(24 * time.Hour),
	})

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}