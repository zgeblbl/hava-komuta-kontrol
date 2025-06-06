package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

// Config holds all configuration for the application
type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
}

// DatabaseConfig holds all database related configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// JWTConfig holds all JWT related configuration
type JWTConfig struct {
	Secret    string
	ExpiresIn time.Duration
}

// ServerConfig holds all server related configuration
type ServerConfig struct {
	Port    string
	GinMode string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		logrus.Warn("Error loading .env file, using environment variables")
	}

	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "123"),
			DBName:   getEnv("DB_NAME", "komutakontrol"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-256-bit-secret"),
		},
		Server: ServerConfig{
			Port:    getEnv("SERVER_PORT", "8080"),
			GinMode: getEnv("GIN_MODE", "debug"),
		},
	}

	// Parse JWT expiration time
	expiresInStr := getEnv("JWT_EXPIRATION", "24h")
	expiresIn, err := time.ParseDuration(expiresInStr)
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION: %v", err)
	}
	config.JWT.ExpiresIn = expiresIn

	return config, nil
}

// GetDSN returns the DSN string for the database connection
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// Helper function to read an environment variable or return a default value
func getEnv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
} 