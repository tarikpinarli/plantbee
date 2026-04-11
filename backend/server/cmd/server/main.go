package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"plantbee-backend/internal/config"
	"plantbee-backend/internal/handlers"
	"plantbee-backend/internal/storage"

	"github.com/go-chi/chi/v5"
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

	r := chi.NewRouter()

	// Public routes
	r.Post("/api/reading", h.IngestData)
	r.Get("/auth/login", h.HandleLogin)
	r.Get("/auth/callback", h.HandleCallback)
	r.Get("/auth/me", h.Me)
	r.Get("/api/plants", h.HandleListPlants)
	r.Post("/api/upload", h.HandleUploadImage) // trang test for image upload

	// Protected routes (JWT required)
	r.Group(func(r chi.Router) {
		r.Use(h.RequireAuth)
		r.Post("/auth/logout", h.HandleLogout)
		r.Post("/api/plants/add", h.HandleAddPlant)
		r.Post("/api/user/welcome", h.HandleWelcome)
		r.Get("/api/tasks", h.HandleGetTasks)
		r.Post("/api/tasks/accept", h.HandleAcceptTask)
		r.Post("/api/tasks/cancel", h.HandleCancelTask)
	})

	// Static uploads
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// SPA fallback: serve the React build for anything not matched above.
	// Unmatched /api/* requests return 404 so the frontend gets a real error.
	fs := http.FileServer(http.Dir("/client/dist"))
	r.NotFound(func(w http.ResponseWriter, req *http.Request) {
		if strings.HasPrefix(req.URL.Path, "/api/") {
			http.NotFound(w, req)
			return
		}
		if _, err := os.Stat("/client/dist" + req.URL.Path); os.IsNotExist(err) {
			http.ServeFile(w, req, "/client/dist/index.html")
			return
		}
		fs.ServeHTTP(w, req)
	})

	// Start the background process to check for "radio silence" (24 hours offline)
	// We run the check every 1 hour.
	h.SensorService.StartOfflineMonitor(24*time.Hour, 1*time.Hour)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, r))
}
