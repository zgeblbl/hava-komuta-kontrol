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

// Custom error types for business logic
type BusinessError struct {
	Message string
	Code    string
}

func (e *BusinessError) Error() string {
	return e.Message
}

func NewBusinessError(code, message string) *BusinessError {
	return &BusinessError{Code: code, Message: message}
}

// AircraftService handles aircraft related operations
type AircraftService struct {
	db *gorm.DB
}

// NewAircraftService creates a new AircraftService
func NewAircraftService() *AircraftService {
	return &AircraftService{
		db: database.GetDB(),
	}
}

// GetAircrafts gets all aircrafts with pagination
func (s *AircraftService) GetAircrafts(page, pageSize int) ([]models.Aircraft, int64, error) {
	var aircrafts []models.Aircraft
	var count int64

	// Get total count
	if err := s.db.Model(&models.Aircraft{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get aircrafts with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("CurrentState").
		Offset(offset).Limit(pageSize).Find(&aircrafts).Error; err != nil {
		return nil, 0, err
	}

	return aircrafts, count, nil
}

// GetAircraftByID gets an aircraft by ID
func (s *AircraftService) GetAircraftByID(id int) (*models.Aircraft, error) {
	var aircraft models.Aircraft

	if err := s.db.Preload("CurrentState").
		Where("id = ?", id).First(&aircraft).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("aircraft not found")
		}
		return nil, err
	}

	return &aircraft, nil
}

// GetAircraftByCode gets an aircraft by code
func (s *AircraftService) GetAircraftByCode(code string) (*models.Aircraft, error) {
	var aircraft models.Aircraft

	if err := s.db.Preload("CurrentState").
		Where("code = ?", code).First(&aircraft).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("aircraft not found")
		}
		return nil, err
	}

	return &aircraft, nil
}

// CreateAircraft creates a new aircraft (legacy method for backward compatibility)
func (s *AircraftService) CreateAircraft(code, model, owner string) (*models.Aircraft, error) {
	// Create a new aircraft
	aircraft := &models.Aircraft{
		Code:      code,
		Model:     model,
		Owner:     owner,
		Status:    models.AircraftStatusStandby, // Default status
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save the aircraft to the database
	if err := s.db.Create(aircraft).Error; err != nil {
		logrus.Errorf("Error creating aircraft: %v", err)
		return nil, err
	}

	return aircraft, nil
}

// CreateAircraftFull creates a new aircraft with all fields
func (s *AircraftService) CreateAircraftFull(
	code, tailNumber, model, manufacturer string,
	yearManufactured int,
	owner string,
	maxSpeed, cruiseSpeed, maxAltitude, range_, fuelCapacity, emptyWeight, maxTakeoffWeight float64,
	status string,
	currentLocationID *int,
) (*models.Aircraft, error) {
	// Set default status if empty
	if status == "" {
		status = string(models.AircraftStatusStandby)
	}

	// Create a new aircraft with all fields
	aircraft := &models.Aircraft{
		Code:               code,
		TailNumber:         tailNumber,
		Model:              model,
		Manufacturer:       manufacturer,
		YearManufactured:   yearManufactured,
		Owner:              owner,
		MaxSpeed:           maxSpeed,
		CruiseSpeed:        cruiseSpeed,
		MaxAltitude:        maxAltitude,
		Range:              range_,
		FuelCapacity:       fuelCapacity,
		EmptyWeight:        emptyWeight,
		MaxTakeoffWeight:   maxTakeoffWeight,
		Status:             models.AircraftStatus(status),
		CurrentLocationID:  currentLocationID,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Save the aircraft to the database
	if err := s.db.Create(aircraft).Error; err != nil {
		logrus.Errorf("Error creating aircraft: %v", err)
		return nil, err
	}

	// Reload the aircraft to get all relationships
	var newAircraft models.Aircraft
	if err := s.db.Preload("CurrentLocation").Preload("CurrentState").
		Where("id = ?", aircraft.ID).First(&newAircraft).Error; err != nil {
		return aircraft, err // Return the aircraft even if preload fails
	}

	return &newAircraft, nil
}

// UpdateAircraft updates an aircraft
func (s *AircraftService) UpdateAircraft(id int, data map[string]interface{}) error {
	// Check if the aircraft exists
	if _, err := s.GetAircraftByID(id); err != nil {
		return err
	}

	// Add updated_at timestamp
	data["updated_at"] = time.Now()

	// Update the aircraft
	if err := s.db.Model(&models.Aircraft{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating aircraft: %v", err)
		return err
	}

	return nil
}

// DeleteAircraft deletes an aircraft with comprehensive dependency checking
func (s *AircraftService) DeleteAircraft(id int) error {
	// 1. Check if aircraft exists
	aircraft, err := s.GetAircraftByID(id)
	if err != nil {
		return err
	}

	// 2. Check for flight plans dependency
	var flightPlanCount int64
	err = s.db.Model(&models.FlightPlan{}).Where("aircraft_id = ?", id).Count(&flightPlanCount).Error
	if err != nil {
		logrus.Errorf("Error checking flight plans: %v", err)
		return errors.New("veritabanı kontrolü yapılamadı")
	}

	if flightPlanCount > 0 {
		// Get sample flight plans for error message
		var samplePlans []models.FlightPlan
		s.db.Select("flight_number, status").Where("aircraft_id = ?", id).Limit(3).Find(&samplePlans)
		
		message := fmt.Sprintf("HATA: %s kodlu uçak silinemez!\n\n", aircraft.Code)
		message += fmt.Sprintf("❌ Bu uçakla %d adet uçuş planı ilişkilendirilmiş:\n", flightPlanCount)
		
		for i, plan := range samplePlans {
			if i >= 3 {
				message += "   ...\n"
				break
			}
			message += fmt.Sprintf("   • %s (%s)\n", plan.FlightNumber, plan.Status)
		}
		
		message += "\n🔧 Çözüm: Önce bu uçuş planlarını silin veya başka uçağa atayın."
		return NewBusinessError("AIRCRAFT_HAS_FLIGHT_PLANS", message)
	}

	// 3. Check for active flights dependency
	var flightCount int64
	err = s.db.Table("flights f").
		Joins("INNER JOIN flight_plans fp ON f.flight_plan_id = fp.id").
		Where("fp.aircraft_id = ?", id).
		Count(&flightCount).Error
	
	if err != nil {
		logrus.Errorf("Error checking flights: %v", err)
		return errors.New("uçuş kontrolü yapılamadı")
	}

	if flightCount > 0 {
		// Get sample flights for error message
		type FlightSample struct {
			FlightNumber     string `json:"flight_number"`
			Status           string `json:"status"`
			FlightPlanNumber string `json:"flight_plan_number"`
		}
		
		var sampleFlights []FlightSample
		s.db.Table("flights f").
			Select("f.flight_number, f.status, fp.flight_number as flight_plan_number").
			Joins("INNER JOIN flight_plans fp ON f.flight_plan_id = fp.id").
			Where("fp.aircraft_id = ?", id).
			Limit(3).
			Scan(&sampleFlights)
		
		message := fmt.Sprintf("HATA: %s kodlu uçak silinemez!\n\n", aircraft.Code)
		message += fmt.Sprintf("❌ Bu uçakla %d adet aktif uçuş ilişkilendirilmiş:\n", flightCount)
		
		for i, flight := range sampleFlights {
			if i >= 3 {
				message += "   ...\n"
				break
			}
			message += fmt.Sprintf("   • %s (%s) - Plan: %s\n", flight.FlightNumber, flight.Status, flight.FlightPlanNumber)
		}
		
		message += "\n🔧 Çözüm: Önce bu uçuşları tamamlayın veya iptal edin."
		return NewBusinessError("AIRCRAFT_HAS_FLIGHTS", message)
	}

	// 4. Safe deletion with transaction
	return s.performAircraftDeletion(id, aircraft.Code)
}

// performAircraftDeletion performs the actual deletion in a transaction
func (s *AircraftService) performAircraftDeletion(aircraftID int, aircraftCode string) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		return errors.New("silme işlemi başlatılamadı")
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			logrus.Errorf("Panic during aircraft deletion: %v", r)
		}
	}()

	// Delete related data in order
	steps := []struct {
		name  string
		query func() error
	}{
		{
			name: "aircraft_history",
			query: func() error {
				return tx.Where("aircraft_id = ?", aircraftID).Delete(&models.AircraftHistory{}).Error
			},
		},
		{
			name: "aircraft_state",
			query: func() error {
				return tx.Where("aircraft_id = ?", aircraftID).Delete(&models.AircraftState{}).Error
			},
		},
		{
			name: "aircraft",
			query: func() error {
				return tx.Delete(&models.Aircraft{}, aircraftID).Error
			},
		},
	}

	for _, step := range steps {
		if err := step.query(); err != nil {
			tx.Rollback()
			logrus.Errorf("Error deleting %s for aircraft %d: %v", step.name, aircraftID, err)
			return fmt.Errorf("%s silinemedi", step.name)
		}
	}

	if err := tx.Commit().Error; err != nil {
		logrus.Errorf("Error committing aircraft deletion: %v", err)
		return errors.New("silme işlemi tamamlanamadı")
	}

	logrus.Infof("✅ Aircraft successfully deleted: ID=%d, Code=%s", aircraftID, aircraftCode)
	return nil
}

// UpdateAircraftState updates or creates an aircraft's current state
func (s *AircraftService) UpdateAircraftState(
	aircraftID int, 
	latitude, longitude, altitude, heading float64,
) (*models.AircraftState, error) {
	// Check if the aircraft exists
	if _, err := s.GetAircraftByID(aircraftID); err != nil {
		return nil, err
	}

	var state models.AircraftState

	// Check if state already exists
	err := s.db.Where("aircraft_id = ?", aircraftID).First(&state).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// If state exists, update it
	if state.ID != 0 {
		state.Latitude = latitude
		state.Longitude = longitude
		state.Altitude = altitude
		state.Heading = heading
		state.Timestamp = time.Now()

		if err := s.db.Save(&state).Error; err != nil {
			logrus.Errorf("Error updating aircraft state: %v", err)
			return nil, err
		}
	} else {
		// Create new state
		state = models.AircraftState{
			AircraftID: aircraftID,
			Latitude:   latitude,
			Longitude:  longitude,
			Altitude:   altitude,
			Heading:    heading,
			Timestamp:  time.Now(),
		}

		if err := s.db.Create(&state).Error; err != nil {
			logrus.Errorf("Error creating aircraft state: %v", err)
			return nil, err
		}
	}

	// Add to history
	history := models.AircraftHistory{
		AircraftID:  aircraftID,
		EventType:   "POSITION_UPDATE",
		Description: fmt.Sprintf("Lat: %.6f, Lon: %.6f, Alt: %.1f", latitude, longitude, altitude),
		Timestamp:   time.Now(),
	}

	if err := s.db.Create(&history).Error; err != nil {
		logrus.Errorf("Error creating aircraft history: %v", err)
		// Don't return error here, as the state update was successful
	}

	return &state, nil
}

// GetAircraftHistory gets the history of an aircraft with pagination
func (s *AircraftService) GetAircraftHistory(aircraftID, page, pageSize int) ([]models.AircraftHistory, int64, error) {
	var history []models.AircraftHistory
	var count int64

	// Check if the aircraft exists
	if _, err := s.GetAircraftByID(aircraftID); err != nil {
		return nil, 0, err
	}

	// Get total count
	if err := s.db.Model(&models.AircraftHistory{}).Where("aircraft_id = ?", aircraftID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get history with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("aircraft_id = ?", aircraftID).
		Order("timestamp DESC").
		Offset(offset).Limit(pageSize).Find(&history).Error; err != nil {
		return nil, 0, err
	}

	return history, count, nil
}

// GetAircraftRelatedData gets detailed information about flight plans and flights for an aircraft
func (s *AircraftService) GetAircraftRelatedData(aircraftID int) (map[string]interface{}, error) {
	// Check if the aircraft exists
	if _, err := s.GetAircraftByID(aircraftID); err != nil {
		return nil, err
	}

	result := make(map[string]interface{})

	// Get flight plans with airport information
	type FlightPlanInfo struct {
		ID                    int       `json:"id"`
		FlightNumber          string    `json:"flight_number"`
		Status                string    `json:"status"`
		AircraftID            int       `json:"aircraft_id"`
		DepartureAirportID    int       `json:"departure_airport_id"`
		ArrivalAirportID      int       `json:"arrival_airport_id"`
		PlannedDepartureTime  time.Time `json:"planned_departure_time"`
		PlannedArrivalTime    *time.Time `json:"planned_arrival_time"`
		DepartureAirportName  string    `json:"departure_airport_name"`
		ArrivalAirportName    string    `json:"arrival_airport_name"`
		CreatedAt             time.Time `json:"created_at"`
	}

	var flightPlans []FlightPlanInfo
	if err := s.db.Table("flight_plans fp").
		Select(`fp.id, fp.flight_number, fp.status, fp.aircraft_id, fp.departure_airport_id, 
				fp.arrival_airport_id, fp.planned_departure_time, fp.estimated_arrival_time as planned_arrival_time, fp.created_at,
				da.airport_name as departure_airport_name, aa.airport_name as arrival_airport_name`).
		Joins("LEFT JOIN airports da ON fp.departure_airport_id = da.id").
		Joins("LEFT JOIN airports aa ON fp.arrival_airport_id = aa.id").
		Where("fp.aircraft_id = ?", aircraftID).
		Order("fp.planned_departure_time DESC").
		Scan(&flightPlans).Error; err != nil {
		logrus.Errorf("Error getting flight plans for aircraft: %v", err)
		return nil, errors.New("could not get flight plans")
	}

	// Get flights with flight plan information
	type FlightInfo struct {
		FlightID             int       `json:"flight_id"`
		FlightNumber         string    `json:"flight_number"`
		Status               string    `json:"status"`
		ActualDepartureTime  *time.Time `json:"actual_departure_time"`
		ActualArrivalTime    *time.Time `json:"actual_arrival_time"`
		FlightPlanNumber     string    `json:"flight_plan_number"`
		DepartureAirportName string    `json:"departure_airport_name"`
		ArrivalAirportName   string    `json:"arrival_airport_name"`
		CreatedAt            time.Time `json:"created_at"`
	}

	var flights []FlightInfo
	if err := s.db.Table("flights f").
		Select(`f.id as flight_id, f.flight_number, f.status, f.actual_departure_time, 
				f.actual_arrival_time, f.created_at,
				fp.flight_number as flight_plan_number, da.airport_name as departure_airport_name, 
				aa.airport_name as arrival_airport_name`).
		Joins("INNER JOIN flight_plans fp ON f.flight_plan_id = fp.id").
		Joins("LEFT JOIN airports da ON fp.departure_airport_id = da.id").
		Joins("LEFT JOIN airports aa ON fp.arrival_airport_id = aa.id").
		Where("fp.aircraft_id = ?", aircraftID).
		Order("f.created_at DESC").
		Scan(&flights).Error; err != nil {
		logrus.Errorf("Error getting flights for aircraft: %v", err)
		return nil, errors.New("could not get flights")
	}

	// Build result
	result["flight_plans"] = map[string]interface{}{
		"count": len(flightPlans),
		"data":  flightPlans,
	}

	result["flights"] = map[string]interface{}{
		"count": len(flights),
		"data":  flights,
	}

	result["can_delete"] = len(flightPlans) == 0 && len(flights) == 0
	
	if len(flightPlans) > 0 {
		result["delete_prevention_reason"] = "flight_plans_exist"
	} else if len(flights) > 0 {
		result["delete_prevention_reason"] = "flights_exist"
	}

	return result, nil
}

// GetAircraftHistoryTimeRange gets the history of an aircraft within a time range
func (s *AircraftService) GetAircraftHistoryTimeRange(aircraftID int, startTime, endTime time.Time) ([]models.AircraftHistory, error) {
	var history []models.AircraftHistory

	// Check if the aircraft exists
	if _, err := s.GetAircraftByID(aircraftID); err != nil {
		return nil, err
	}

	// Get history within time range
	if err := s.db.Where("aircraft_id = ? AND timestamp BETWEEN ? AND ?", aircraftID, startTime, endTime).
		Order("timestamp ASC").
		Find(&history).Error; err != nil {
		return nil, err
	}

	return history, nil
}

// ForceDeleteAircraft forcefully deletes an aircraft and all its dependencies (FOR TESTING/DEMO ONLY)
func (s *AircraftService) ForceDeleteAircraft(id int) error {
	// 1. Check if aircraft exists
	aircraft, err := s.GetAircraftByID(id)
	if err != nil {
		return err
	}

	// 2. Start transaction for cascade deletion
	tx := s.db.Begin()
	if tx.Error != nil {
		return errors.New("silme işlemi başlatılamadı")
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			logrus.Errorf("Panic during force aircraft deletion: %v", r)
		}
	}()

	// 3. Delete in correct order to avoid foreign key violations
	steps := []struct {
		name  string
		query func() error
	}{
		{
			name: "flight_points (via flights)",
			query: func() error {
				// Delete flight points for flights associated with this aircraft's flight plans
				return tx.Exec(`
					DELETE FROM flight_points 
					WHERE flight_id IN (
						SELECT f.id FROM flights f 
						INNER JOIN flight_plans fp ON f.flight_plan_id = fp.id 
						WHERE fp.aircraft_id = ?
					)`, id).Error
			},
		},
		{
			name: "flights (via flight_plans)",
			query: func() error {
				// Delete flights for flight plans associated with this aircraft
				return tx.Exec(`
					DELETE FROM flights 
					WHERE flight_plan_id IN (
						SELECT id FROM flight_plans WHERE aircraft_id = ?
					)`, id).Error
			},
		},
		{
			name: "flight_plans",
			query: func() error {
				return tx.Where("aircraft_id = ?", id).Delete(&models.FlightPlan{}).Error
			},
		},
		{
			name: "aircraft_history",
			query: func() error {
				return tx.Where("aircraft_id = ?", id).Delete(&models.AircraftHistory{}).Error
			},
		},
		{
			name: "aircraft_state",
			query: func() error {
				return tx.Where("aircraft_id = ?", id).Delete(&models.AircraftState{}).Error
			},
		},
		{
			name: "aircraft",
			query: func() error {
				return tx.Delete(&models.Aircraft{}, id).Error
			},
		},
	}

	for _, step := range steps {
		if err := step.query(); err != nil {
			tx.Rollback()
			logrus.Errorf("Error force deleting %s for aircraft %d: %v", step.name, id, err)
			return fmt.Errorf("%s silinemedi: %v", step.name, err)
		}
		logrus.Infof("🗑️ Deleted %s for aircraft %d", step.name, id)
	}

	if err := tx.Commit().Error; err != nil {
		logrus.Errorf("Error committing force aircraft deletion: %v", err)
		return errors.New("silme işlemi tamamlanamadı")
	}

	logrus.Infof("✅ Aircraft FORCE DELETED with all dependencies: ID=%d, Code=%s", id, aircraft.Code)
	return nil
} 