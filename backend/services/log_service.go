package services

import (
	"time"

	"komutakontrol/database"
	"komutakontrol/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// LogService handles logging related operations
type LogService struct {
	db *gorm.DB
}

// NewLogService creates a new LogService
func NewLogService() *LogService {
	return &LogService{
		db: database.GetDB(),
	}
}

// LogAction logs an action in the database
func (s *LogService) LogAction(userID int, actionType, actionDescription string) error {
	log := &models.Log{
		UserID:            userID,
		ActionType:        actionType,
		ActionDescription: actionDescription,
		Timestamp:         time.Now(),
	}

	if err := s.db.Create(log).Error; err != nil {
		logrus.Errorf("Error creating log: %v", err)
		return err
	}

	return nil
}

// LogActionFromContext logs an action from a Gin context
func (s *LogService) LogActionFromContext(c *gin.Context, actionType, actionDescription string) error {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		logrus.Warn("User ID not found in context, logging without user ID")
		return s.LogAction(0, actionType, actionDescription)
	}

	// Get IP address and user agent
	log := &models.Log{
		UserID:            userID.(int),
		ActionType:        actionType,
		ActionDescription: actionDescription,
		IPAddress:         c.ClientIP(),
		UserAgent:         c.GetHeader("User-Agent"),
		Timestamp:         time.Now(),
	}

	if err := s.db.Create(log).Error; err != nil {
		logrus.Errorf("Error creating log: %v", err)
		return err
	}

	return nil
}

// GetLogs gets all logs with pagination
func (s *LogService) GetLogs(page, pageSize int) ([]models.Log, int64, error) {
	var logs []models.Log
	var count int64

	// Get total count
	if err := s.db.Model(&models.Log{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get logs with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Preload("User").Offset(offset).Limit(pageSize).Order("timestamp DESC").Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, count, nil
}

// GetUserLogs gets logs for a specific user with pagination
func (s *LogService) GetUserLogs(userID, page, pageSize int) ([]models.Log, int64, error) {
	var logs []models.Log
	var count int64

	// Get total count
	if err := s.db.Model(&models.Log{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get logs with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Where("user_id = ?", userID).Offset(offset).Limit(pageSize).Order("timestamp DESC").Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, count, nil
} 