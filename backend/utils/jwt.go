package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"komutakontrol/config"
	"komutakontrol/models"
)

// Custom claims structure
type JWTClaims struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a user
func GenerateToken(user *models.User, config *config.Config) (string, time.Time, error) {
	expiresAt := time.Now().Add(config.JWT.ExpiresIn)
	
	claims := JWTClaims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.JWT.Secret))
	if err != nil {
		return "", time.Time{}, err
	}

	// Update last login time
	user.LastLogin = time.Now()

	return tokenString, expiresAt, nil
}

// GenerateOperatorToken generates a JWT token for an operator
func GenerateOperatorToken(operator *models.Operator, config *config.Config) (string, time.Time, error) {
	expiresAt := time.Now().Add(config.JWT.ExpiresIn)
	
	claims := JWTClaims{
		UserID: operator.ID,
		Role:   string(operator.AuthorityLevel), // Using authority level as role
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", operator.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.JWT.Secret))
	if err != nil {
		return "", time.Time{}, err
	}

	// Update last active time
	now := time.Now()
	operator.LastActive = &now

	return tokenString, expiresAt, nil
}

// VerifyToken verifies a JWT token and returns the claims
func VerifyToken(tokenString string, config *config.Config) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.JWT.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
} 