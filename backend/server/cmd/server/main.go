package main

import (
	"log"
	"net/http"
	"os"

	"plantbee-backend/internal/config"
	"plantbee-backend/internal/handlers"
	"plantbee-backend/internal/storage"
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
	http.HandleFunc("/auth/logout", h.RequireAuth(h.HandleLogout))
	http.HandleFunc("/plants/add", h.RequireAuth(h.HandleAddPlant))
	http.HandleFunc("/api/user/welcome", h.RequireAuth(h.HandleWelcome))
	http.HandleFunc("/api/tasks/accept", h.RequireAuth(h.HandleAcceptTask))
	http.HandleFunc("/api/tasks/cancel", h.RequireAuth(h.HandleCancelTask))
	// Serve the frontend static files
	fs := http.FileServer(http.Dir("/client/dist"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If it's an API route that wasn't caught above, return 404
		if len(r.URL.Path) >= 5 && r.URL.Path[:5] == "/api/" {
			http.NotFound(w, r)
			return
		}

		// Check if the requested file exists
		if _, err := os.Stat("/client/dist" + r.URL.Path); os.IsNotExist(err) {
			// If file not found, serve index.html for React Router
			http.ServeFile(w, r, "/client/dist/index.html")
			return
		}

		fs.ServeHTTP(w, r)
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, nil))
}
