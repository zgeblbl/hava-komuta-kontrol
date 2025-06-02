package services

import (
	"errors"
	"fmt"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// FlightService handles flight related operations
type FlightService struct {
	db *gorm.DB
}

// NewFlightService creates a new FlightService
func NewFlightService() *FlightService {
	return &FlightService{
		db: database.GetDB(),
	}
}

// GetFlights gets all flights with pagination and filtering
func (s *FlightService) GetFlights(page, pageSize int, status, priority string) ([]models.Flight, int64, error) {
	var flights []models.Flight
	var count int64

	query := s.db.Model(&models.Flight{})

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}

	// Get total count
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flights with pagination and relationships
	offset := (page - 1) * pageSize
	if err := query.Preload("FlightPlan").Preload("FlightPlan.Aircraft").
		Preload("FlightPlan.DepartureAirport").Preload("FlightPlan.ArrivalAirport").
		Preload("Pilot").Preload("CoPilot").Preload("Creator").
		Preload("FlightPoints").
		Order("created_at DESC").
		Offset(offset).Limit(pageSize).Find(&flights).Error; err != nil {
		return nil, 0, err
	}

	return flights, count, nil
}

// GetFlightByID gets a flight by ID with all relationships
func (s *FlightService) GetFlightByID(id int) (*models.Flight, error) {
	var flight models.Flight

	if err := s.db.Preload("FlightPlan").Preload("FlightPlan.Aircraft").
		Preload("FlightPlan.DepartureAirport").Preload("FlightPlan.ArrivalAirport").
		Preload("FlightPlan.MissionType").
		Preload("Pilot").Preload("CoPilot").Preload("Creator").Preload("Updater").
		Preload("FlightPoints").
		Where("id = ?", id).First(&flight).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("uçuş bulunamadı")
		}
		return nil, err
	}

	return &flight, nil
}

// GetFlightByFlightPlanID gets a flight by flight plan ID
func (s *FlightService) GetFlightByFlightPlanID(flightPlanID int) (*models.Flight, error) {
	var flight models.Flight

	if err := s.db.Preload("FlightPlan").Preload("FlightPlan.Aircraft").
		Preload("FlightPlan.DepartureAirport").Preload("FlightPlan.ArrivalAirport").
		Preload("FlightPoints").
		Where("flight_plan_id = ?", flightPlanID).First(&flight).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("flight not found")
		}
		return nil, err
	}

	return &flight, nil
}

// CreateFlight creates a new flight
func (s *FlightService) CreateFlight(
	flightNumber string,
	flightPlanID int,
	pilotID, coPilotID *int,
	scheduledDepartureTime, scheduledArrivalTime *time.Time,
	priority int,
	weatherCondition, notes string,
	createdBy int,
) (*models.Flight, error) {
	// Validate flight plan exists
	var flightPlan models.FlightPlan
	if err := s.db.First(&flightPlan, flightPlanID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, NewBusinessError("FLIGHT_PLAN_NOT_FOUND", "Uçuş planı bulunamadı")
		}
		return nil, err
	}

	// Check if flight plan is approved
	if flightPlan.Status != models.FlightStatusApproved {
		return nil, NewBusinessError("FLIGHT_PLAN_NOT_APPROVED", "Sadece onaylanmış uçuş planları için uçuş oluşturulabilir")
	}

	// Check if flight already exists for this flight plan
	var existingFlight models.Flight
	if err := s.db.Where("flight_plan_id = ?", flightPlanID).First(&existingFlight).Error; err == nil {
		return nil, NewBusinessError("FLIGHT_ALREADY_EXISTS", "Bu uçuş planı için zaten bir uçuş oluşturulmuş")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Validate pilots exist if provided
	if pilotID != nil {
		var pilot models.Operator
		if err := s.db.First(&pilot, *pilotID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, NewBusinessError("PILOT_NOT_FOUND", "Pilot bulunamadı")
			}
			return nil, err
		}
	}

	if coPilotID != nil {
		var coPilot models.Operator
		if err := s.db.First(&coPilot, *coPilotID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, NewBusinessError("COPILOT_NOT_FOUND", "Co-pilot bulunamadı")
			}
			return nil, err
		}
	}

	// Validate priority
	if priority < 1 || priority > 4 {
		priority = 1 // Default to low priority
	}

	// Create flight
	flight := &models.Flight{
		FlightNumber:           flightNumber,
		FlightPlanID:          flightPlanID,
		PilotID:               pilotID,
		CoPilotID:             coPilotID,
		Status:                models.FlightStatusPlanned,
		ScheduledDepartureTime: scheduledDepartureTime,
		ScheduledArrivalTime:  scheduledArrivalTime,
		Priority:              priority,
		WeatherCondition:      weatherCondition,
		Notes:                 notes,
		CreatedBy:             createdBy,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := s.db.Create(flight).Error; err != nil {
		logrus.Errorf("Error creating flight: %v", err)
		return nil, err
	}

	// Reload with relationships
	return s.GetFlightByID(flight.ID)
}

// UpdateFlight updates flight information
func (s *FlightService) UpdateFlight(id int, updates map[string]interface{}, updatedBy int) error {
	// Check if flight exists
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	// Check if flight can be updated
	if flight.Status == models.FlightStatusCompleted || flight.Status == models.FlightStatusCancelled {
		return NewBusinessError("FLIGHT_CANNOT_BE_UPDATED", "Tamamlanmış veya iptal edilmiş uçuşlar güncellenemez")
	}

	// Add metadata
	updates["updated_by"] = updatedBy
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&models.Flight{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error updating flight: %v", err)
		return err
	}

	return nil
}

// StartFlight starts a flight (changes status to IN_FLIGHT)
func (s *FlightService) StartFlight(id int, actualDepartureTime time.Time, updatedBy int) error {
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	if !flight.CanBeStarted() {
		return NewBusinessError("FLIGHT_CANNOT_BE_STARTED", 
			fmt.Sprintf("Uçuş başlatılamaz. Mevcut durum: %s", flight.GetStatusText()))
	}

	updates := map[string]interface{}{
		"status":                 models.FlightStatusInFlight,
		"actual_departure_time":  actualDepartureTime,
		"updated_by":             updatedBy,
		"updated_at":             time.Now(),
	}

	if err := s.db.Model(&models.Flight{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error starting flight: %v", err)
		return err
	}

	logrus.Infof("Flight started: ID=%d, FlightNumber=%s", id, flight.FlightNumber)
	return nil
}

// CompleteFlight completes a flight
func (s *FlightService) CompleteFlight(
	id int,
	actualArrivalTime time.Time,
	actualFuelUsed, maxAltitudeReached, distanceTraveled float64,
	notes string,
	updatedBy int,
) error {
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	if !flight.CanBeCompleted() {
		return NewBusinessError("FLIGHT_CANNOT_BE_COMPLETED", 
			fmt.Sprintf("Uçuş tamamlanamaz. Mevcut durum: %s", flight.GetStatusText()))
	}

	// Calculate flight duration if we have departure time
	var flightDuration *int
	if flight.ActualDepartureTime != nil {
		duration := int(actualArrivalTime.Sub(*flight.ActualDepartureTime).Minutes())
		flightDuration = &duration
	}

	updates := map[string]interface{}{
		"status":                models.FlightStatusCompleted,
		"actual_arrival_time":   actualArrivalTime,
		"actual_fuel_used":      actualFuelUsed,
		"max_altitude_reached":  maxAltitudeReached,
		"distance_traveled":     distanceTraveled,
		"flight_duration":       flightDuration,
		"notes":                 notes,
		"updated_by":            updatedBy,
		"updated_at":            time.Now(),
	}

	if err := s.db.Model(&models.Flight{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error completing flight: %v", err)
		return err
	}

	logrus.Infof("Flight completed: ID=%d, FlightNumber=%s", id, flight.FlightNumber)
	return nil
}

// CancelFlight cancels a flight
func (s *FlightService) CancelFlight(id int, reason string, updatedBy int) error {
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	if !flight.CanBeCancelled() {
		return NewBusinessError("FLIGHT_CANNOT_BE_CANCELLED", 
			fmt.Sprintf("Uçuş iptal edilemez. Mevcut durum: %s", flight.GetStatusText()))
	}

	updates := map[string]interface{}{
		"status":     models.FlightStatusCancelled,
		"notes":      reason,
		"updated_by": updatedBy,
		"updated_at": time.Now(),
	}

	if err := s.db.Model(&models.Flight{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error cancelling flight: %v", err)
		return err
	}

	logrus.Infof("Flight cancelled: ID=%d, FlightNumber=%s, Reason=%s", id, flight.FlightNumber, reason)
	return nil
}

// UpdateFlightStatus updates flight status with optional additional data
func (s *FlightService) UpdateFlightStatus(
	id int, 
	newStatus models.FlightStatus, 
	additionalData map[string]interface{}, 
	updatedBy int,
) error {
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	// Validate status transition
	if err := s.validateStatusTransition(flight.Status, newStatus); err != nil {
		return err
	}

	updates := map[string]interface{}{
		"status":     newStatus,
		"updated_by": updatedBy,
		"updated_at": time.Now(),
	}

	// Merge additional data
	for key, value := range additionalData {
		updates[key] = value
	}

	if err := s.db.Model(&models.Flight{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		logrus.Errorf("Error updating flight status: %v", err)
		return err
	}

	logrus.Infof("Flight status updated: ID=%d, OldStatus=%s, NewStatus=%s", id, flight.Status, newStatus)
	return nil
}

// validateStatusTransition validates if status transition is allowed
func (s *FlightService) validateStatusTransition(currentStatus, newStatus models.FlightStatus) error {
	// Define allowed transitions
	allowedTransitions := map[models.FlightStatus][]models.FlightStatus{
		models.FlightStatusPlanned:   {models.FlightStatusScheduled, models.FlightStatusReady, models.FlightStatusCancelled},
		models.FlightStatusScheduled: {models.FlightStatusBoarding, models.FlightStatusReady, models.FlightStatusDelayed, models.FlightStatusCancelled},
		models.FlightStatusBoarding:  {models.FlightStatusReady, models.FlightStatusDelayed, models.FlightStatusCancelled},
		models.FlightStatusReady:     {models.FlightStatusTaxiing, models.FlightStatusDelayed, models.FlightStatusCancelled},
		models.FlightStatusTaxiing:   {models.FlightStatusTakeoff, models.FlightStatusAborted},
		models.FlightStatusTakeoff:   {models.FlightStatusInFlight, models.FlightStatusAborted, models.FlightStatusEmergency},
		models.FlightStatusInFlight:  {models.FlightStatusLanding, models.FlightStatusDiverted, models.FlightStatusEmergency},
		models.FlightStatusLanding:   {models.FlightStatusLanded, models.FlightStatusAborted, models.FlightStatusEmergency},
		models.FlightStatusLanded:    {models.FlightStatusCompleted},
		models.FlightStatusDelayed:   {models.FlightStatusScheduled, models.FlightStatusCancelled},
		models.FlightStatusEmergency: {models.FlightStatusLanded, models.FlightStatusAborted, models.FlightStatusDiverted},
	}

	if allowed, exists := allowedTransitions[currentStatus]; exists {
		for _, allowedStatus := range allowed {
			if newStatus == allowedStatus {
				return nil
			}
		}
	}

	return NewBusinessError("INVALID_STATUS_TRANSITION", 
		fmt.Sprintf("Durum geçişi geçersiz: %s -> %s", currentStatus, newStatus))
}

// DeleteFlight deletes a flight (only if not started)
func (s *FlightService) DeleteFlight(id int) error {
	flight, err := s.GetFlightByID(id)
	if err != nil {
		return err
	}

	if flight.Status != models.FlightStatusPlanned && flight.Status != models.FlightStatusScheduled {
		return NewBusinessError("FLIGHT_CANNOT_BE_DELETED", "Sadece planlanmış veya zamanlanmış uçuşlar silinebilir")
	}

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			logrus.Errorf("Panic during flight deletion: %v", r)
		}
	}()

	// Delete flight points first
	if err := tx.Where("flight_id = ?", id).Delete(&models.FlightPoint{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the flight
	if err := tx.Delete(&models.Flight{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	logrus.Infof("Flight deleted: ID=%d, FlightNumber=%s", id, flight.FlightNumber)
	return nil
}

// GetFlightsByStatus gets flights by status
func (s *FlightService) GetFlightsByStatus(status models.FlightStatus, page, pageSize int) ([]models.Flight, int64, error) {
	return s.GetFlights(page, pageSize, string(status), "")
}

// GetFlightsByPriority gets flights by priority
func (s *FlightService) GetFlightsByPriority(priority int, page, pageSize int) ([]models.Flight, int64, error) {
	return s.GetFlights(page, pageSize, "", fmt.Sprintf("%d", priority))
}

// GetActiveFlights gets all active flights (not completed, cancelled, or aborted)
func (s *FlightService) GetActiveFlights() ([]models.Flight, error) {
	var flights []models.Flight

	excludedStatuses := []models.FlightStatus{
		models.FlightStatusCompleted,
		models.FlightStatusCancelled,
		models.FlightStatusAborted,
	}

	if err := s.db.Preload("FlightPlan").Preload("FlightPlan.Aircraft").
		Preload("FlightPlan.DepartureAirport").Preload("FlightPlan.ArrivalAirport").
		Preload("Pilot").Preload("CoPilot").
		Where("status NOT IN ?", excludedStatuses).
		Order("priority DESC, created_at ASC").
		Find(&flights).Error; err != nil {
		return nil, err
	}

	return flights, nil
}

// GetFlightStats returns flight statistics
func (s *FlightService) GetFlightStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total flights
	var totalFlights int64
	s.db.Model(&models.Flight{}).Count(&totalFlights)
	stats["total_flights"] = totalFlights

	// Flights by status
	statusCounts := make(map[string]int64)
	statuses := []models.FlightStatus{
		models.FlightStatusPlanned,
		models.FlightStatusScheduled,
		models.FlightStatusInFlight,
		models.FlightStatusCompleted,
		models.FlightStatusCancelled,
	}

	for _, status := range statuses {
		var count int64
		s.db.Model(&models.Flight{}).Where("status = ?", status).Count(&count)
		statusCounts[string(status)] = count
	}
	stats["status_counts"] = statusCounts

	// Today's flights
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)
	var todayFlights int64
	s.db.Model(&models.Flight{}).
		Where("created_at >= ? AND created_at < ?", today, tomorrow).
		Count(&todayFlights)
	stats["today_flights"] = todayFlights

	// Active flights
	activeFlights, _ := s.GetActiveFlights()
	stats["active_flights"] = len(activeFlights)

	return stats, nil
}

// GetFlightsByMissionStatus gets flights by mission status with pagination
func (s *FlightService) GetFlightsByMissionStatus(status models.MissionStatus, page, pageSize int) ([]models.Flight, int64, error) {
	var flights []models.Flight
	var count int64

	// Get total count
	if err := s.db.Model(&models.Flight{}).Where("mission_status = ?", status).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get flights with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("FlightPlan").Preload("FlightPlan.Aircraft").
		Preload("FlightPlan.DepartureAirport").Preload("FlightPlan.ArrivalAirport").
		Where("mission_status = ?", status).
		Offset(offset).Limit(pageSize).Find(&flights).Error; err != nil {
		return nil, 0, err
	}

	return flights, count, nil
}

// AddFlightPoint adds a waypoint to a flight plan
func (s *FlightService) AddFlightPoint(flightID int, latitude, longitude float64) (*models.FlightPoint, error) {
	// Create a new flight point
	point := &models.FlightPoint{
		FlightID:  flightID,
		Latitude:  latitude,
		Longitude: longitude,
		CreatedAt: time.Now(),
	}

	// Save the flight point to the database
	if err := s.db.Create(point).Error; err != nil {
		logrus.Errorf("Error creating flight point: %v", err)
		return nil, err
	}

	return point, nil
}

// GetFlightPoints gets all flight points for a flight
func (s *FlightService) GetFlightPoints(flightID int) ([]models.FlightPoint, error) {
	var points []models.FlightPoint

	if err := s.db.Where("flight_id = ?", flightID).Find(&points).Error; err != nil {
		return nil, err
	}

	return points, nil
}

// DeleteFlightPoint deletes a flight point
func (s *FlightService) DeleteFlightPoint(id int) error {
	if err := s.db.Delete(&models.FlightPoint{}, id).Error; err != nil {
		logrus.Errorf("Error deleting flight point: %v", err)
		return err
	}

	return nil
} 