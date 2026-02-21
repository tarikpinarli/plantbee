package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  .env not found, using system environment")
	}

	return &Config{
		Port:         fixPortAddr(getEnv("PORT", "8080")),
		DatabaseURL:  getEnv("DATABASE_URL", ""),
		ClientID:     getEnv("CLIENT_ID", ""),
		ClientSecret: getEnv("CLIENT_SECRET", ""),
		RedirectURI:  getEnv("REDIRECT_URI", "http://localhost:8080/auth/callback"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func fixPortAddr(port string) string {
	if !strings.HasPrefix(port, ":") {
		return ":" + port
	}
	return port
}