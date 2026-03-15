package main

import (
	"plantbee-backend/internal/config"
	"plantbee-backend/internal/handlers"
	"plantbee-backend/internal/storage"
	"log"
	"net/http"
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
	http.HandleFunc("/auth/logout", h.HandleLogout)
	http.HandleFunc("/plants/add", h.RequireAuth(h.HandleAddPlant))
	http.HandleFunc("/api/user/welcome", h.RequireAuth(h.HandleWelcome))
	http.HandleFunc("/api/tasks/accept", h.RequireAuth(h.HandleAcceptTask))
	http.HandleFunc("/api/tasks/cancel", h.RequireAuth(h.HandleCancelTask))
	// Serve the frontend static files
	fs := http.FileServer(http.Dir("/frontend"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.Redirect(w, r, "/landing.html", http.StatusTemporaryRedirect)
			return
		}
		fs.ServeHTTP(w, r)
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, nil))
}
