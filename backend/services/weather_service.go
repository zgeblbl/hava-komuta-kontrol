package services

import (
	"errors"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// WeatherService handles weather condition related operations
type WeatherService struct {
	db *gorm.DB
}

// NewWeatherService creates a new WeatherService
func NewWeatherService() *WeatherService {
	return &WeatherService{
		db: database.GetDB(),
	}
}

// GetWeatherConditions gets all weather conditions with pagination
func (s *WeatherService) GetWeatherConditions(page, pageSize int) ([]models.WeatherCondition, int64, error) {
	var conditions []models.WeatherCondition
	var count int64

	// Get total count
	if err := s.db.Model(&models.WeatherCondition{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get weather conditions with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Airport").
		Offset(offset).Limit(pageSize).Order("timestamp DESC").
		Find(&conditions).Error; err != nil {
		return nil, 0, err
	}

	return conditions, count, nil
}

// GetWeatherConditionByID gets a weather condition by ID
func (s *WeatherService) GetWeatherConditionByID(id int) (*models.WeatherCondition, error) {
	var condition models.WeatherCondition

	if err := s.db.Preload("Airport").
		Where("id = ?", id).First(&condition).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("weather condition not found")
		}
		return nil, err
	}

	return &condition, nil
}

// GetLatestWeatherByAirport gets the latest weather condition for an airport
func (s *WeatherService) GetLatestWeatherByAirport(airportID int) (*models.WeatherCondition, error) {
	var condition models.WeatherCondition

	if err := s.db.Where("airport_id = ?", airportID).
		Order("timestamp DESC").First(&condition).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("weather condition not found")
		}
		return nil, err
	}

	return &condition, nil
}

// CreateWeatherCondition creates a new weather condition
func (s *WeatherService) CreateWeatherCondition(
	airportID int,
	temperature, pressure, humidity, windSpeed, windDirection, visibility, cloudBase, precipitation float64,
	status models.WeatherStatus,
) (*models.WeatherCondition, error) {
	// Create a new weather condition
	condition := &models.WeatherCondition{
		AirportID:     airportID,
		Temperature:   temperature,
		Pressure:      pressure,
		Humidity:      humidity,
		WindSpeed:     windSpeed,
		WindDirection: windDirection,
		Visibility:    visibility,
		CloudBase:     cloudBase,
		Precipitation: precipitation,
		Status:        status,
		Timestamp:     time.Now(),
	}

	// Save the weather condition to the database
	if err := s.db.Create(condition).Error; err != nil {
		logrus.Errorf("Error creating weather condition: %v", err)
		return nil, err
	}

	// Update the airport's weather status
	if err := s.db.Model(&models.Airport{}).
		Where("id = ?", airportID).
		Update("weather_status", status).Error; err != nil {
		logrus.Warnf("Error updating airport weather status: %v", err)
	}

	return condition, nil
}

// GetWeatherHistoryByAirport gets weather history for an airport with pagination
func (s *WeatherService) GetWeatherHistoryByAirport(airportID, page, pageSize int) ([]models.WeatherCondition, int64, error) {
	var conditions []models.WeatherCondition
	var count int64

	// Get total count
	if err := s.db.Model(&models.WeatherCondition{}).
		Where("airport_id = ?", airportID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get weather conditions with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("airport_id = ?", airportID).
		Order("timestamp DESC").
		Offset(offset).Limit(pageSize).Find(&conditions).Error; err != nil {
		return nil, 0, err
	}

	return conditions, count, nil
}

// GetWeatherHistoryTimeRange gets weather history for an airport within a time range
func (s *WeatherService) GetWeatherHistoryTimeRange(airportID int, startTime, endTime time.Time) ([]models.WeatherCondition, error) {
	var conditions []models.WeatherCondition

	// Get weather conditions within time range
	if err := s.db.Where("airport_id = ? AND timestamp BETWEEN ? AND ?", airportID, startTime, endTime).
		Order("timestamp ASC").Find(&conditions).Error; err != nil {
		return nil, err
	}

	return conditions, nil
} 