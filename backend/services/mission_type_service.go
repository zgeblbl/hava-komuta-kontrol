package services

import (
	"errors"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// MissionTypeService handles mission type related operations
type MissionTypeService struct {
	db *gorm.DB
}

// NewMissionTypeService creates a new MissionTypeService
func NewMissionTypeService() *MissionTypeService {
	return &MissionTypeService{
		db: database.GetDB(),
	}
}

// GetMissionTypes gets all mission types with pagination
func (s *MissionTypeService) GetMissionTypes(page, pageSize int) ([]models.MissionType, int64, error) {
	var missionTypes []models.MissionType
	var count int64

	// Get total count
	if err := s.db.Model(&models.MissionType{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get mission types with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Offset(offset).Limit(pageSize).Find(&missionTypes).Error; err != nil {
		return nil, 0, err
	}

	return missionTypes, count, nil
}

// GetMissionTypeByID gets a mission type by ID
func (s *MissionTypeService) GetMissionTypeByID(id int) (*models.MissionType, error) {
	var missionType models.MissionType

	if err := s.db.Where("id = ?", id).First(&missionType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("mission type not found")
		}
		return nil, err
	}

	return &missionType, nil
}

// GetMissionTypeByCode gets a mission type by code
func (s *MissionTypeService) GetMissionTypeByCode(code string) (*models.MissionType, error) {
	var missionType models.MissionType

	if err := s.db.Where("code = ?", code).First(&missionType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("mission type not found")
		}
		return nil, err
	}

	return &missionType, nil
}

// CreateMissionType creates a new mission type
func (s *MissionTypeService) CreateMissionType(name, code, description string) (*models.MissionType, error) {
	// Create a new mission type
	missionType := &models.MissionType{
		Name:        name,
		Code:        code,
		Description: description,
	}

	// Save the mission type to the database
	if err := s.db.Create(missionType).Error; err != nil {
		logrus.Errorf("Error creating mission type: %v", err)
		return nil, err
	}

	return missionType, nil
}

// UpdateMissionType updates a mission type
func (s *MissionTypeService) UpdateMissionType(id int, data map[string]interface{}) error {
	// Check if the mission type exists
	if _, err := s.GetMissionTypeByID(id); err != nil {
		return err
	}

	// Update the mission type
	if err := s.db.Model(&models.MissionType{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating mission type: %v", err)
		return err
	}

	return nil
}

// DeleteMissionType deletes a mission type
func (s *MissionTypeService) DeleteMissionType(id int) error {
	// Check if the mission type exists
	if _, err := s.GetMissionTypeByID(id); err != nil {
		return err
	}

	// Delete the mission type
	if err := s.db.Delete(&models.MissionType{}, id).Error; err != nil {
		logrus.Errorf("Error deleting mission type: %v", err)
		return err
	}

	return nil
} 