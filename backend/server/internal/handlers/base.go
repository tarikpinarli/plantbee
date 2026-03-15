package handlers

import (
	"esp32-server/internal/config"
	"esp32-server/internal/storage"

	"golang.org/x/oauth2"
)

type Handler struct {
	DB          *storage.DB
	OAuthConfig *oauth2.Config
}

func New(db *storage.DB, cfg *config.Config) *Handler {
	oauth := &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURI,
		Scopes:       []string{"public"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://api.intra.42.fr/oauth/authorize",
			TokenURL: "https://api.intra.42.fr/oauth/token",
		},
	}

	return &Handler{
		DB:          db,
		OAuthConfig: oauth,
	}
}
