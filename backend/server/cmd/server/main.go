package main

import (
	"log"
	"net/http"
	"os"
	"time"

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
	http.HandleFunc("/auth/me", h.Me)
	http.HandleFunc("/auth/logout", h.RequireAuth(h.HandleLogout))
	http.HandleFunc("/api/plants/add", h.RequireAuth(h.HandleAddPlant))
	http.HandleFunc("/api/upload", h.HandleUploadImage) // trang test for image upload
	http.HandleFunc("/api/plants", h.HandleListPlants)
	http.HandleFunc("DELETE /api/user", h.RequireAuth(h.DeleteUser))
	http.HandleFunc("/api/user/welcome", h.RequireAuth(h.HandleWelcome))
	http.HandleFunc("/api/user/role", h.RequireAuth(h.HandleUpdateUserRole))
	http.HandleFunc("/api/tasks", h.RequireAuth(h.HandleGetTasks))
	http.HandleFunc("/api/tasks/accept", h.RequireAuth(h.HandleAcceptTask))
	http.HandleFunc("/api/tasks/cancel", h.RequireAuth(h.HandleCancelTask))

	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads")))) // trang test for image upload
	// Serve the frontend static files
	fs := http.FileServer(http.Dir("/client/dist"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If it's an API route that wasn't caught above, return 404
		if len(r.URL.Path) >= 5 && r.URL.Path[:5] == "/api/" || len(r.URL.Path) >= 5 && r.URL.Path[:5] == "/auth/" {
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

	// Start the background process to check for "radio silence" (24 hours offline)
	// We run the check every 1 hour.
	h.SensorService.StartOfflineMonitor(24*time.Hour, 1*time.Hour)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, nil))
}
