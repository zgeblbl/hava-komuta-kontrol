package services

import (
	"errors"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// AirportService handles airport related operations
type AirportService struct {
	db *gorm.DB
}

// NewAirportService creates a new AirportService
func NewAirportService() *AirportService {
	return &AirportService{
		db: database.GetDB(),
	}
}

// GetAirports gets all airports with pagination
func (s *AirportService) GetAirports(page, pageSize int) ([]models.Airport, int64, error) {
	var airports []models.Airport
	var count int64

	// Get total count
	if err := s.db.Model(&models.Airport{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get airports with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Offset(offset).Limit(pageSize).Find(&airports).Error; err != nil {
		return nil, 0, err
	}

	return airports, count, nil
}

// GetAirportByID gets an airport by ID
func (s *AirportService) GetAirportByID(id int) (*models.Airport, error) {
	var airport models.Airport

	if err := s.db.Where("id = ?", id).First(&airport).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("airport not found")
		}
		return nil, err
	}

	return &airport, nil
}

// GetAirportByIcaoCode gets an airport by ICAO code
func (s *AirportService) GetAirportByIcaoCode(icaoCode string) (*models.Airport, error) {
	var airport models.Airport

	if err := s.db.Where("icao_code = ?", icaoCode).First(&airport).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("airport not found")
		}
		return nil, err
	}

	return &airport, nil
}

// CreateAirport creates a new airport
func (s *AirportService) CreateAirport(
	name string,
	icaoCode string,
	latitude float64,
	longitude float64,
	city string,
	country string,
	airStatusCelcius int,
) (*models.Airport, error) {
	// Create a new airport
	airport := &models.Airport{
		Name:             name,
		IcaoCode:         icaoCode,
		Latitude:         latitude,
		Longitude:        longitude,
		City:             city,
		Country:          country,
		AirStatusCelcius: airStatusCelcius,
	}

	// Save the airport to the database
	if err := s.db.Create(airport).Error; err != nil {
		logrus.Errorf("Error creating airport: %v", err)
		return nil, err
	}

	return airport, nil
}

// UpdateAirport updates an airport
func (s *AirportService) UpdateAirport(id int, data map[string]interface{}) error {
	// Check if the airport exists
	if _, err := s.GetAirportByID(id); err != nil {
		return err
	}

	// Update the airport
	if err := s.db.Model(&models.Airport{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating airport: %v", err)
		return err
	}

	return nil
}

// DeleteAirport deletes an airport
func (s *AirportService) DeleteAirport(id int) error {
	// Check if the airport exists
	if _, err := s.GetAirportByID(id); err != nil {
		return err
	}

	// Delete the airport
	if err := s.db.Delete(&models.Airport{}, id).Error; err != nil {
		logrus.Errorf("Error deleting airport: %v", err)
		return err
	}

	return nil
}

// GetAirportsByCountry gets airports by country with pagination
func (s *AirportService) GetAirportsByCountry(country string, page, pageSize int) ([]models.Airport, int64, error) {
	var airports []models.Airport
	var count int64

	// Get total count
	if err := s.db.Model(&models.Airport{}).Where("country = ?", country).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get airports with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("country = ?", country).
		Offset(offset).Limit(pageSize).Find(&airports).Error; err != nil {
		return nil, 0, err
	}

	return airports, count, nil
}

// GetAirportsByCity gets airports by city with pagination
func (s *AirportService) GetAirportsByCity(city string, page, pageSize int) ([]models.Airport, int64, error) {
	var airports []models.Airport
	var count int64

	// Get total count
	if err := s.db.Model(&models.Airport{}).Where("city = ?", city).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get airports with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("city = ?", city).
		Offset(offset).Limit(pageSize).Find(&airports).Error; err != nil {
		return nil, 0, err
	}

	return airports, count, nil
} 