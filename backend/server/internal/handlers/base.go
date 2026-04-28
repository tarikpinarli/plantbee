package handlers

import (
	"context"
	"log"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"golang.org/x/oauth2"

	"plantbee-backend/internal/config"
	"plantbee-backend/internal/services"
	"plantbee-backend/internal/storage"
)

type Handler struct {
	DB            *storage.DB
	OAuthConfig   *oauth2.Config
	SensorService *services.SensorService
	AuthService   *services.AuthService
	TaskService   *services.TaskService
	Cfg           *config.Config
	S3Client      *s3.Client
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

	var s3Client *s3.Client
	if cfg.S3BucketName != "" {
		awsCfg, err := awsconfig.LoadDefaultConfig(context.Background())
		if err != nil {
			log.Printf("warning: failed to load AWS config: %v", err)
		} else {
			s3Client = s3.NewFromConfig(awsCfg)
		}
	}

	return &Handler{
		DB:            db,
		OAuthConfig:   oauth,
		SensorService: services.NewSensorService(db),
		AuthService:   services.NewAuthService(),
		TaskService:   services.NewTaskService(db),
		Cfg:           cfg,
		S3Client:      s3Client,
	}
}
