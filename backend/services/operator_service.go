package services

import (
	"errors"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// OperatorService handles operator related operations
type OperatorService struct {
	db *gorm.DB
}

// NewOperatorService creates a new OperatorService
func NewOperatorService() *OperatorService {
	return &OperatorService{
		db: database.GetDB(),
	}
}

// GetOperators gets all operators with pagination
func (s *OperatorService) GetOperators(page, pageSize int) ([]models.Operator, int64, error) {
	var operators []models.Operator
	var count int64

	// Get total count
	if err := s.db.Model(&models.Operator{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get operators with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Unit").Preload("Station").
		Offset(offset).Limit(pageSize).Find(&operators).Error; err != nil {
		return nil, 0, err
	}

	return operators, count, nil
}

// GetOperatorByID gets an operator by ID
func (s *OperatorService) GetOperatorByID(id int) (*models.Operator, error) {
	var operator models.Operator

	if err := s.db.Preload("Unit").Preload("Station").
		Where("user_id = ?", id).First(&operator).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("operator not found")
		}
		return nil, err
	}

	return &operator, nil
}

// CreateOperator creates a new operator
func (s *OperatorService) CreateOperator(
	operatorCode string,
	rankID int,
	firstName string,
	lastName string,
	email string,
	phone string,
	unitID int,
	stationID int,
	authorityLevel models.AuthorityLevel,
	shiftStart time.Time,
	shiftEnd time.Time,
	profilePhotoURL string,
) (*models.Operator, error) {
	// Create a new operator
	operator := &models.Operator{
		OperatorCode:    operatorCode,
		RankID:          rankID,
		FirstName:       firstName,
		LastName:        lastName,
		Email:           email,
		Phone:           phone,
		Status:          models.StatusActive,
		UnitID:          unitID,
		StationID:       stationID,
		AuthorityLevel:  authorityLevel,
		ShiftStart:      shiftStart.Format(time.RFC3339),
		ShiftEnd:        shiftEnd.Format(time.RFC3339),
		ProfilePhotoURL: profilePhotoURL,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Save the operator to the database
	if err := s.db.Create(operator).Error; err != nil {
		logrus.Errorf("Error creating operator: %v", err)
		return nil, err
	}

	return operator, nil
}

// UpdateOperator updates an operator
func (s *OperatorService) UpdateOperator(id int, data map[string]interface{}) error {
	// Check if the operator exists
	if _, err := s.GetOperatorByID(id); err != nil {
		return err
	}

	// Update the operator
	data["updated_at"] = time.Now()
	if err := s.db.Model(&models.Operator{}).Where("user_id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating operator: %v", err)
		return err
	}

	return nil
}

// DeleteOperator deletes an operator
func (s *OperatorService) DeleteOperator(id int) error {
	// Check if the operator exists
	if _, err := s.GetOperatorByID(id); err != nil {
		return err
	}

	// Delete the operator
	if err := s.db.Where("user_id = ?", id).Delete(&models.Operator{}).Error; err != nil {
		logrus.Errorf("Error deleting operator: %v", err)
		return err
	}

	return nil
}

// GetOperatorsByUnit gets operators by unit ID
func (s *OperatorService) GetOperatorsByUnit(unitID, page, pageSize int) ([]models.Operator, int64, error) {
	var operators []models.Operator
	var count int64

	// Get total count
	if err := s.db.Model(&models.Operator{}).Where("unit_id = ?", unitID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get operators with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Unit").Preload("Station").
		Where("unit_id = ?", unitID).
		Offset(offset).Limit(pageSize).Find(&operators).Error; err != nil {
		return nil, 0, err
	}

	return operators, count, nil
}

// GetOperatorsByStation gets operators by station ID
func (s *OperatorService) GetOperatorsByStation(stationID, page, pageSize int) ([]models.Operator, int64, error) {
	var operators []models.Operator
	var count int64

	// Get total count
	if err := s.db.Model(&models.Operator{}).Where("station_id = ?", stationID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get operators with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("Unit").Preload("Station").
		Where("station_id = ?", stationID).
		Offset(offset).Limit(pageSize).Find(&operators).Error; err != nil {
		return nil, 0, err
	}

	return operators, count, nil
} 