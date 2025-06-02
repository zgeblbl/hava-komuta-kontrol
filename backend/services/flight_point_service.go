package services

import (
	"errors"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// FlightPointService handles flight point related operations
type FlightPointService struct {
	db *gorm.DB
}

// NewFlightPointService creates a new FlightPointService
func NewFlightPointService() *FlightPointService {
	return &FlightPointService{
		db: database.GetDB(),
	}
}

// GetFlightPointsByFlightID gets all flight points for a flight with pagination
func (s *FlightPointService) GetFlightPointsByFlightID(flightID int, page, pageSize int) ([]models.FlightPoint, int64, error) {
	var flightPoints []models.FlightPoint
	var count int64

	// Get total count
	if err := s.db.Model(&models.FlightPoint{}).Where("flight_id = ?", flightID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flight points with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("flight_id = ?", flightID).
		Order("sequence_number ASC").
		Offset(offset).Limit(pageSize).Find(&flightPoints).Error; err != nil {
		return nil, 0, err
	}

	return flightPoints, count, nil
}

// GetFlightPointByID gets a flight point by ID
func (s *FlightPointService) GetFlightPointByID(id int) (*models.FlightPoint, error) {
	var flightPoint models.FlightPoint

	if err := s.db.Where("id = ?", id).First(&flightPoint).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("flight point not found")
		}
		return nil, err
	}

	return &flightPoint, nil
}

// CreateFlightPoint creates a new flight point
func (s *FlightPointService) CreateFlightPoint(
	flightID int,
	sequenceNumber int,
	latitude, longitude, altitude, speed, heading float64,
	estimatedTimeOfArrival *time.Time,
	pointType, description string,
) (*models.FlightPoint, error) {
	// Check if the flight exists
	var flight models.Flight
	if err := s.db.Where("id = ?", flightID).First(&flight).Error; err != nil {
		return nil, errors.New("flight not found")
	}

	// Create a new flight point
	flightPoint := &models.FlightPoint{
		FlightID:              flightID,
		SequenceNumber:        sequenceNumber,
		Latitude:              latitude,
		Longitude:             longitude,
		Altitude:              altitude,
		Speed:                 speed,
		Heading:               heading,
		EstimatedTimeOfArrival: estimatedTimeOfArrival,
		PointType:             pointType,
		Description:           description,
		CreatedAt:             time.Now(),
	}

	// Save the flight point to the database
	if err := s.db.Create(flightPoint).Error; err != nil {
		logrus.Errorf("Error creating flight point: %v", err)
		return nil, err
	}

	return flightPoint, nil
}

// UpdateFlightPoint updates a flight point
func (s *FlightPointService) UpdateFlightPoint(id int, data map[string]interface{}) error {
	// Check if the flight point exists
	if _, err := s.GetFlightPointByID(id); err != nil {
		return err
	}

	// Update the flight point
	if err := s.db.Model(&models.FlightPoint{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating flight point: %v", err)
		return err
	}

	return nil
}

// DeleteFlightPoint deletes a flight point
func (s *FlightPointService) DeleteFlightPoint(id int) error {
	// Check if the flight point exists
	if _, err := s.GetFlightPointByID(id); err != nil {
		return err
	}

	// Delete the flight point
	if err := s.db.Delete(&models.FlightPoint{}, id).Error; err != nil {
		logrus.Errorf("Error deleting flight point: %v", err)
		return err
	}

	return nil
}

// RecordActualArrival records the actual arrival time at a flight point
func (s *FlightPointService) RecordActualArrival(id int, actualTimeOfArrival time.Time) error {
	// Check if the flight point exists
	flightPoint, err := s.GetFlightPointByID(id)
	if err != nil {
		return err
	}

	// Update the flight point
	updates := map[string]interface{}{
		"actual_time_of_arrival": actualTimeOfArrival,
	}

	if err := s.db.Model(&models.FlightPoint{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error recording actual arrival time: %v", err)
		return err
	}

	// If this is the last point in the sequence, update the flight's arrival time
	var maxSequenceNumber int
	if err := s.db.Model(&models.FlightPoint{}).
		Where("flight_id = ?", flightPoint.FlightID).
		Select("MAX(sequence_number)").
		Scan(&maxSequenceNumber).Error; err != nil {
		logrus.Warnf("Error checking if this is the last point: %v", err)
		return nil
	}

	if flightPoint.SequenceNumber == maxSequenceNumber {
		if err := s.db.Model(&models.Flight{}).
			Where("id = ?", flightPoint.FlightID).
			Update("actual_arrival_time", actualTimeOfArrival).Error; err != nil {
			logrus.Warnf("Error updating flight arrival time: %v", err)
		}
	}

	return nil
}

// GetNextFlightPoints gets the next flight points after a given sequence number
func (s *FlightPointService) GetNextFlightPoints(flightID, currentSequence, limit int) ([]models.FlightPoint, error) {
	var flightPoints []models.FlightPoint

	if err := s.db.Where("flight_id = ? AND sequence_number > ?", flightID, currentSequence).
		Order("sequence_number ASC").
		Limit(limit).Find(&flightPoints).Error; err != nil {
		return nil, err
	}

	return flightPoints, nil
} 