package services

import (
	"errors"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// FlightPlanService handles flight plan related operations
type FlightPlanService struct {
	db *gorm.DB
}

// NewFlightPlanService creates a new FlightPlanService
func NewFlightPlanService() *FlightPlanService {
	return &FlightPlanService{
		db: database.GetDB(),
	}
}

// GetFlightPlans gets all flight plans with pagination
func (s *FlightPlanService) GetFlightPlans(page, pageSize int) ([]models.FlightPlan, int64, error) {
	var flightPlans []models.FlightPlan
	var count int64

	// Get total count
	if err := s.db.Model(&models.FlightPlan{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flight plans with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Preload("Flight").
		Offset(offset).Limit(pageSize).Find(&flightPlans).Error; err != nil {
		return nil, 0, err
	}

	return flightPlans, count, nil
}

// GetFlightPlanByID gets a flight plan by ID
func (s *FlightPlanService) GetFlightPlanByID(id int) (*models.FlightPlan, error) {
	var flightPlan models.FlightPlan

	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Preload("Flight").
		Where("id = ?", id).First(&flightPlan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("flight plan not found")
		}
		return nil, err
	}

	return &flightPlan, nil
}

// GetFlightPlanByFlightNumber gets a flight plan by flight number
func (s *FlightPlanService) GetFlightPlanByFlightNumber(flightNumber string) (*models.FlightPlan, error) {
	var flightPlan models.FlightPlan

	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Preload("Flight").
		Where("flight_number = ?", flightNumber).First(&flightPlan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("flight plan not found")
		}
		return nil, err
	}

	return &flightPlan, nil
}

// CreateFlightPlan creates a new flight plan
func (s *FlightPlanService) CreateFlightPlan(
	flightNumber string,
	aircraftID, missionTypeID, departureAirportID, arrivalAirportID int,
	alternateAirportID *int,
	plannedDepartureTime, estimatedArrivalTime time.Time,
	flightLevel, fuelPlanned float64,
	routeDescription string,
	createdBy int,
) (*models.FlightPlan, error) {
	// Create a new flight plan
	flightPlan := &models.FlightPlan{
		FlightNumber:         flightNumber,
		AircraftID:           aircraftID,
		MissionTypeID:        missionTypeID,
		DepartureAirportID:   departureAirportID,
		ArrivalAirportID:     arrivalAirportID,
		AlternateAirportID:   alternateAirportID,
		PlannedDepartureTime: plannedDepartureTime,
		EstimatedArrivalTime: estimatedArrivalTime,
		FlightLevel:          flightLevel,
		RouteDescription:     routeDescription,
		FuelPlanned:          fuelPlanned,
		Status:               models.FlightStatusPlanned,
		CreatedBy:            createdBy,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}

	// Save the flight plan to the database
	if err := s.db.Create(flightPlan).Error; err != nil {
		logrus.Errorf("Error creating flight plan: %v", err)
		return nil, err
	}

	// Reload the flight plan to get all relationships
	var newFlightPlan models.FlightPlan
	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").
		Where("id = ?", flightPlan.ID).First(&newFlightPlan).Error; err != nil {
		return flightPlan, err // Return the flight plan even if preload fails
	}

	return &newFlightPlan, nil
}

// UpdateFlightPlan updates a flight plan
func (s *FlightPlanService) UpdateFlightPlan(id int, data map[string]interface{}) error {
	// Check if the flight plan exists
	if _, err := s.GetFlightPlanByID(id); err != nil {
		return err
	}

	// Update the flight plan
	data["updated_at"] = time.Now()
	if err := s.db.Model(&models.FlightPlan{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating flight plan: %v", err)
		return err
	}

	return nil
}

// ApproveFlightPlan approves a flight plan
func (s *FlightPlanService) ApproveFlightPlan(id, approverID int) error {
	// Check if the flight plan exists
	flightPlan, err := s.GetFlightPlanByID(id)
	if err != nil {
		return err
	}

	// Check if the flight plan is already approved
	if flightPlan.ApprovedBy != nil {
		return errors.New("flight plan is already approved")
	}

	// Update the flight plan
	updates := map[string]interface{}{
		"approved_by": approverID,
		"status":      models.FlightStatusActive,
		"updated_at":  time.Now(),
	}

	if err := s.db.Model(&models.FlightPlan{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error approving flight plan: %v", err)
		return err
	}

	return nil
}

// CancelFlightPlan cancels a flight plan
func (s *FlightPlanService) CancelFlightPlan(id int) error {
	// Check if the flight plan exists
	flightPlan, err := s.GetFlightPlanByID(id)
	if err != nil {
		return err
	}

	// Check if the flight plan is already completed or cancelled
	if flightPlan.Status == models.FlightStatusCompleted || flightPlan.Status == models.FlightStatusCancelled {
		return errors.New("cannot cancel a completed or already cancelled flight plan")
	}

	// Update the flight plan
	updates := map[string]interface{}{
		"status":     models.FlightStatusCancelled,
		"updated_at": time.Now(),
	}

	if err := s.db.Model(&models.FlightPlan{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error cancelling flight plan: %v", err)
		return err
	}

	return nil
}

// DeleteFlightPlan deletes a flight plan
func (s *FlightPlanService) DeleteFlightPlan(id int) error {
	// Check if the flight plan exists
	flightPlan, err := s.GetFlightPlanByID(id)
	if err != nil {
		return err
	}

	// Only allow deletion of planned flight plans
	if flightPlan.Status != models.FlightStatusPlanned {
		return errors.New("only planned flight plans can be deleted")
	}

	// Delete the flight plan
	if err := s.db.Delete(&models.FlightPlan{}, id).Error; err != nil {
		logrus.Errorf("Error deleting flight plan: %v", err)
		return err
	}

	return nil
}

// GetFlightPlansByAircraft gets flight plans by aircraft ID with pagination
func (s *FlightPlanService) GetFlightPlansByAircraft(aircraftID, page, pageSize int) ([]models.FlightPlan, int64, error) {
	var flightPlans []models.FlightPlan
	var count int64

	// Get total count
	if err := s.db.Model(&models.FlightPlan{}).Where("aircraft_id = ?", aircraftID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flight plans with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Where("aircraft_id = ?", aircraftID).
		Offset(offset).Limit(pageSize).Find(&flightPlans).Error; err != nil {
		return nil, 0, err
	}

	return flightPlans, count, nil
}

// GetFlightPlansByStatus gets flight plans by status with pagination
func (s *FlightPlanService) GetFlightPlansByStatus(status models.FlightStatus, page, pageSize int) ([]models.FlightPlan, int64, error) {
	var flightPlans []models.FlightPlan
	var count int64

	// Get total count
	if err := s.db.Model(&models.FlightPlan{}).Where("status = ?", status).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flight plans with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Where("status = ?", status).
		Offset(offset).Limit(pageSize).Find(&flightPlans).Error; err != nil {
		return nil, 0, err
	}

	return flightPlans, count, nil
}

// GetFlightPlansByDateRange gets flight plans by date range with pagination
func (s *FlightPlanService) GetFlightPlansByDateRange(startDate, endDate time.Time, page, pageSize int) ([]models.FlightPlan, int64, error) {
	var flightPlans []models.FlightPlan
	var count int64

	// Get total count
	if err := s.db.Model(&models.FlightPlan{}).
		Where("planned_departure_time BETWEEN ? AND ?", startDate, endDate).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flight plans with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Aircraft").Preload("MissionType").
		Preload("DepartureAirport").Preload("ArrivalAirport").
		Preload("AlternateAirport").Preload("Creator").Preload("Approver").
		Where("planned_departure_time BETWEEN ? AND ?", startDate, endDate).
		Offset(offset).Limit(pageSize).Find(&flightPlans).Error; err != nil {
		return nil, 0, err
	}

	return flightPlans, count, nil
} 