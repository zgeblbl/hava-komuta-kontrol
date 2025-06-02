package services

import (
	"errors"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// HexagonService handles hexagon related operations
type HexagonService struct {
	db *gorm.DB
}

// NewHexagonService creates a new HexagonService
func NewHexagonService() *HexagonService {
	return &HexagonService{
		db: database.GetDB(),
	}
}

// GetHexagons gets all hexagons with pagination
func (s *HexagonService) GetHexagons(page, pageSize int) ([]models.Hexagon, int64, error) {
	var hexagons []models.Hexagon
	var count int64

	// Get total count
	if err := s.db.Model(&models.Hexagon{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get hexagons with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Offset(offset).Limit(pageSize).Find(&hexagons).Error; err != nil {
		return nil, 0, err
	}

	return hexagons, count, nil
}

// GetHexagonByID gets a hexagon by ID
func (s *HexagonService) GetHexagonByID(id int) (*models.Hexagon, error) {
	var hexagon models.Hexagon

	if err := s.db.Where("id = ?", id).First(&hexagon).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("hexagon not found")
		}
		return nil, err
	}

	return &hexagon, nil
}

// GetHexagonByGridReference gets a hexagon by grid reference
func (s *HexagonService) GetHexagonByGridReference(gridReference string) (*models.Hexagon, error) {
	var hexagon models.Hexagon

	if err := s.db.Where("grid_reference = ?", gridReference).First(&hexagon).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("hexagon not found")
		}
		return nil, err
	}

	return &hexagon, nil
}

// CreateHexagon creates a new hexagon
func (s *HexagonService) CreateHexagon(
	centerLatitude, centerLongitude, radius float64,
	gridReference string,
	elevationMin, elevationMax float64,
	terrainType string,
) (*models.Hexagon, error) {
	// Create a new hexagon
	hexagon := &models.Hexagon{
		CenterLatitude:  centerLatitude,
		CenterLongitude: centerLongitude,
		Radius:          radius,
		GridReference:   gridReference,
		ElevationMin:    elevationMin,
		ElevationMax:    elevationMax,
		TerrainType:     terrainType,
	}

	// Save the hexagon to the database
	if err := s.db.Create(hexagon).Error; err != nil {
		logrus.Errorf("Error creating hexagon: %v", err)
		return nil, err
	}

	return hexagon, nil
}

// UpdateHexagon updates a hexagon
func (s *HexagonService) UpdateHexagon(id int, data map[string]interface{}) error {
	// Check if the hexagon exists
	if _, err := s.GetHexagonByID(id); err != nil {
		return err
	}

	// Update the hexagon
	if err := s.db.Model(&models.Hexagon{}).Where("id = ?", id).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating hexagon: %v", err)
		return err
	}

	return nil
}

// DeleteHexagon deletes a hexagon
func (s *HexagonService) DeleteHexagon(id int) error {
	// Check if the hexagon exists
	if _, err := s.GetHexagonByID(id); err != nil {
		return err
	}

	// Delete the hexagon
	if err := s.db.Delete(&models.Hexagon{}, id).Error; err != nil {
		logrus.Errorf("Error deleting hexagon: %v", err)
		return err
	}

	return nil
}

// GetHexagonsByTerrainType gets hexagons by terrain type with pagination
func (s *HexagonService) GetHexagonsByTerrainType(terrainType string, page, pageSize int) ([]models.Hexagon, int64, error) {
	var hexagons []models.Hexagon
	var count int64

	// Get total count
	if err := s.db.Model(&models.Hexagon{}).Where("terrain_type = ?", terrainType).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get hexagons with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("terrain_type = ?", terrainType).Offset(offset).Limit(pageSize).Find(&hexagons).Error; err != nil {
		return nil, 0, err
	}

	return hexagons, count, nil
}

// GetHexagonsInBoundingBox gets hexagons within a bounding box with pagination
func (s *HexagonService) GetHexagonsInBoundingBox(minLat, minLon, maxLat, maxLon float64, page, pageSize int) ([]models.Hexagon, int64, error) {
	var hexagons []models.Hexagon
	var count int64

	// Get total count
	if err := s.db.Model(&models.Hexagon{}).
		Where("center_latitude BETWEEN ? AND ? AND center_longitude BETWEEN ? AND ?", minLat, maxLat, minLon, maxLon).
		Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get hexagons with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("center_latitude BETWEEN ? AND ? AND center_longitude BETWEEN ? AND ?", minLat, maxLat, minLon, maxLon).
		Offset(offset).Limit(pageSize).Find(&hexagons).Error; err != nil {
		return nil, 0, err
	}

	return hexagons, count, nil
} 