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
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Get("/api/status", h.HandleStatus)

	r.Post("/api/reading", h.IngestData)

	r.Route("/auth", func(r chi.Router) {
		r.Get("/login", h.HandleLogin)
		r.Get("/callback", h.HandleCallback)
		r.Get("/me", h.Me)
		r.With(h.RequireAuth).Get("/logout", h.HandleLogout)
	})

	r.Route("/api", func(r chi.Router) {
		r.Post("/upload", h.HandleUploadImage)
		r.Get("/leaderboard", h.HandleGetLeaderboard)
		r.Get("/plants", h.HandleListPlants)
		r.Get("/plants/{id}", h.HandleGetPlantByID)

		r.Group(func(r chi.Router) {
			r.Use(h.RequireAuth)

			r.Delete("/user", h.DeleteUser)
			r.Post("/user/welcome", h.HandleWelcome)
			r.Patch("/user/role", h.HandleUpdateUserRole)
			r.Get("/user/plants", h.HandleListUserPlants)

			r.Post("/plants/add", h.HandleAddPlant)
			r.Delete("/plants/{id}", h.HandleDeletePlant)

			r.Get("/tasks", h.HandleGetTasks)
			r.Post("/tasks/accept", h.HandleAcceptTask)
			r.Post("/tasks/cancel", h.HandleCancelTask)
		})
	})

	r.Mount("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))))

	fs := http.FileServer(http.Dir("/client/dist"))
	r.NotFound(func(w http.ResponseWriter, req *http.Request) {
		path := req.URL.Path
		if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/auth/") {
			http.NotFound(w, req)
			return
		}

		if _, err := os.Stat("/client/dist" + path); os.IsNotExist(err) {
			http.ServeFile(w, req, "/client/dist/index.html")
			return
		}

		fs.ServeHTTP(w, req)
	})

	// Background process to flag sensors that have gone silent for 24h.
	h.SensorService.StartOfflineMonitor(24*time.Hour, 1*time.Hour)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, r))
}
