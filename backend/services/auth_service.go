package services

import (
	"errors"
	"time"

	"komutakontrol/config"
	"komutakontrol/database"
	"komutakontrol/models"
	"komutakontrol/utils"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// AuthService handles authentication related operations
type AuthService struct {
	config *config.Config
	db     *gorm.DB
}

// NewAuthService creates a new AuthService
func NewAuthService(config *config.Config) *AuthService {
	return &AuthService{
		config: config,
		db:     database.GetDB(),
	}
}

// RegisterUser registers a new user
func (s *AuthService) RegisterUser(username, email, password, role string) (*models.User, error) {
	// Hash the password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		logrus.Errorf("Error hashing password: %v", err)
		return nil, err
	}

	// Create a new user
	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: hashedPassword,
		Role:         role,
		IsActive:     true,
		CreatedAt:    time.Now(),
	}

	// Save the user to the database
	if err := s.db.Create(user).Error; err != nil {
		logrus.Errorf("Error creating user: %v", err)
		return nil, err
	}

	return user, nil
}

// LoginUser authenticates a user and generates a JWT token
func (s *AuthService) LoginUser(email, password string) (string, time.Time, *models.User, error) {
	var user models.User

	// Find the user by email
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", time.Time{}, nil, errors.New("invalid email or password")
		}
		return "", time.Time{}, nil, err
	}

	// Check if the user is active
	if !user.IsActive {
		return "", time.Time{}, nil, errors.New("user account is inactive")
	}

	// Verify the password
	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return "", time.Time{}, nil, errors.New("invalid email or password")
	}

	// Generate a JWT token
	token, expiresAt, err := utils.GenerateToken(&user, s.config)
	if err != nil {
		return "", time.Time{}, nil, err
	}

	// Update last login time
	now := time.Now()
	if err := s.db.Model(&user).Update("last_login", now).Error; err != nil {
		logrus.Errorf("Error updating last login time: %v", err)
	}
	user.LastLogin = now

	// Create a new session
	session := models.UserSession{
		UserID:    user.ID,
		Token:     token,
		LoginTime: now,
		IsActive:  true,
	}

	// Save the session to the database
	if err := s.db.Create(&session).Error; err != nil {
		return "", time.Time{}, nil, err
	}

	return token, expiresAt, &user, nil
}

// LoginOperator authenticates an operator and generates a JWT token
func (s *AuthService) LoginOperator(email, password string) (string, time.Time, *models.Operator, error) {
	var operator models.Operator

	// Find the operator by email
	if err := s.db.Where("email = ?", email).First(&operator).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", time.Time{}, nil, errors.New("invalid email or password")
		}
		return "", time.Time{}, nil, err
	}

	// Check if the operator is active
	if operator.Status != models.StatusActive {
		return "", time.Time{}, nil, errors.New("operator account is not active")
	}

	// Note: Password verification is not implemented here since the operator table doesn't have a password field.
	// In a real system, you would need to implement this.

	// Generate a JWT token
	token, expiresAt, err := utils.GenerateOperatorToken(&operator, s.config)
	if err != nil {
		return "", time.Time{}, nil, err
	}

	return token, expiresAt, &operator, nil
}

// ValidateToken validates a JWT token
func (s *AuthService) ValidateToken(tokenString string) (*utils.JWTClaims, error) {
	return utils.VerifyToken(tokenString, s.config)
} 