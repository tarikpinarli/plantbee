package services

import (
	"fmt"
	"os"
	"plantbee-backend/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	secretKey []byte
}

func NewAuthService() *AuthService {
	return &AuthService{
		secretKey: []byte(os.Getenv("SESSION_SECRET")),
	}
}

// GenerateToken creates a new JWT for the specified user.
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"login":   user.Login,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(s.secretKey)
}

// ValidateToken parses and validates a JWT string.
func (s *AuthService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})
}
