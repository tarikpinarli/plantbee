// To run this script locally and seed your database with fake users:
// Make sure your docker containers are running, then execute the following command from the backend/server directory:
// DATABASE_URL=postgres://postgres:postgres@localhost:5432/plantbee?sslmode=disable go run cmd/seed/main.go
package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"plantbee-backend/internal/config"
	"plantbee-backend/internal/models"
	"plantbee-backend/internal/storage"
)

func main() {
	cfg := config.Load()

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := storage.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	log.Println("Connected to Database. Creating mock users...")

	rand.Seed(time.Now().UnixNano())

	names := []string{"alice", "bob", "charlie", "diana", "eve", "frank", "grace", "hank", "ivy", "jack"}

	for i := 0; i < 10; i++ {
		name := names[i]
		randomSuffix := rand.Intn(1000)
		intraID := fmt.Sprintf("%s_%d", name, randomSuffix)

		user := &models.User{
			IntraID:      intraID,
			Email:        fmt.Sprintf("%s%d@student.42.fr", name, randomSuffix),
			Login:        fmt.Sprintf("%s%d", name, randomSuffix),
			ImageURL:     fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", name),
			IntendToHelp: rand.Intn(2) == 1,
			FirstVisit:   false,
			WaterCount:   rand.Intn(50), // Random water count between 0 and 49
		}

		err := db.UpsertUser(user)
		if err != nil {
			log.Printf("Failed to insert user %s: %v", user.Login, err)
		} else {
			log.Printf("Inserted user %s with ID %d, water count %d", user.Login, user.ID, user.WaterCount)
		}
	}

	log.Println("Successfully generated mock users.")
}
