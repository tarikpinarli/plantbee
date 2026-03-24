package main

import (
	"fmt"
	"log"
	"net/http"

	"esp32-server/internal/config"
	"esp32-server/internal/handlers"
	"esp32-server/internal/storage"
)

func main() {
	cfg := config.Load()

	var db *storage.DB
	var err error

	if cfg.DatabaseURL != "" {
		db, err = storage.New(cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("Database connection failed: %v", err)
		}

		if err := db.CreateTables(); err != nil {
			log.Fatalf("Failed to create tables: %v", err)
		}

		log.Println("Connected to Database & Tables Created")
	} else {
		log.Println("Running in NO-DATABASE mode")
	}

	h := handlers.New(db, cfg)

	http.HandleFunc("/api/reading", h.IngestData)
	http.HandleFunc("/auth/login", h.HandleLogin)
	http.HandleFunc("/auth/callback", h.HandleCallback)
	http.HandleFunc("/api/plants/add", h.HandleAddPlant)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		if _, err := fmt.Fprint(w, "<h1>PlantBee Server Online!</h1><p>System is running.</p>"); err != nil {
			log.Printf("failed to write root response: %v", err)
		}
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, nil))
}
