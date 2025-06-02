package services

import (
	"errors"
	"fmt"
	"time"

	"komutakontrol/database"
	"komutakontrol/models"
	"komutakontrol/utils"
	"golang.org/x/crypto/bcrypt"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// UserService handles user related operations
type UserService struct {
	db *gorm.DB
}

// NewUserService creates a new UserService
func NewUserService() *UserService {
	return &UserService{
		db: database.GetDB(),
	}
}

// UserWithOperatorInfo extended user info with operator details
type UserWithOperatorInfo struct {
	models.User
	Operator *models.Operator `json:"operator,omitempty"`
}

// GetUsers gets all users with pagination and operator info if available
func (s *UserService) GetUsers(page, pageSize int) ([]UserWithOperatorInfo, int64, error) {
	var users []models.User
	var count int64

	// Get total count
	if err := s.db.Model(&models.User{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get users with pagination
	offset := (page - 1) * pageSize
	if err := s.db.Select("id, username, email, role, is_active, created_at, last_login").
		Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	// Create result slice
	var result []UserWithOperatorInfo

	// For each user, try to get operator info (regardless of role)
	for _, user := range users {
		userWithOperator := UserWithOperatorInfo{User: user}
		
		// Try to get operator info for any user (not just operators)
		var operator models.Operator
		err := s.db.Preload("Unit").Preload("Station").
			Where("user_id = ?", user.ID).First(&operator).Error
		
		if err == nil {
			userWithOperator.Operator = &operator
		}
		
		result = append(result, userWithOperator)
	}

	return result, count, nil
}

// GetUserByID gets a user by ID with operator info if available
func (s *UserService) GetUserByID(id int) (*UserWithOperatorInfo, error) {
	var user models.User

	if err := s.db.Select("id, username, email, role, is_active, created_at").
		Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Create result with user info
	result := &UserWithOperatorInfo{User: user}

	// Try to get operator info if exists
	var operator models.Operator
	err := s.db.Preload("Unit").Preload("Station").
		Where("user_id = ?", user.ID).First(&operator).Error
	
	if err == nil {
		result.Operator = &operator
	}

	return result, nil
}

// CreateUser creates a new user
func (s *UserService) CreateUser(username, email, password, role string) (*models.User, error) {
	// Hash the password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		logrus.Errorf("Error hashing password: %v", err)
		return nil, err
	}

	// Create a new user
	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: hashedPassword,
		Role:         role,
		IsActive:     true,
	}

	// Save the user to the database
	if err := s.db.Create(user).Error; err != nil {
		logrus.Errorf("Error creating user: %v", err)
		return nil, err
	}

	return user, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(id int, data map[string]interface{}) error {
	// Check if the user exists
	userWithOperator, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	// Update the user
	if err := s.db.Model(&models.User{}).Where("id = ?", userWithOperator.User.ID).Updates(data).Error; err != nil {
		logrus.Errorf("Error updating user: %v", err)
		return err
	}

	return nil
}

// DeleteUser deletes a user and related operator record if exists
func (s *UserService) DeleteUser(id int) error {
	// Check if the user exists
	userWithOperator, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	// Start a transaction for consistency
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// First, delete operator record if exists
	if err := tx.Where("user_id = ?", userWithOperator.User.ID).Delete(&models.Operator{}).Error; err != nil {
		tx.Rollback()
		logrus.Errorf("Error deleting operator record: %v", err)
		return err
	}

	// Delete user sessions
	if err := tx.Where("user_id = ?", userWithOperator.User.ID).Delete(&models.UserSession{}).Error; err != nil {
		tx.Rollback()
		logrus.Errorf("Error deleting user sessions: %v", err)
		return err
	}

	// Delete user logs
	if err := tx.Where("user_id = ?", userWithOperator.User.ID).Delete(&models.Log{}).Error; err != nil {
		tx.Rollback()
		logrus.Errorf("Error deleting user logs: %v", err)
		return err
	}

	// Finally, delete the user
	if err := tx.Delete(&models.User{}, userWithOperator.User.ID).Error; err != nil {
		tx.Rollback()
		logrus.Errorf("Error deleting user: %v", err)
		return err
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		logrus.Errorf("Error committing transaction: %v", err)
		return err
	}

	logrus.Infof("Successfully deleted user and related records for user ID: %d", id)
	return nil
}

// ChangePassword changes a user's password
func (s *UserService) ChangePassword(id int, currentPassword, newPassword string) error {
	var user models.User

	// Get the user with the password hash
	if err := s.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Verify the current password
	if !utils.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	// Hash the new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		logrus.Errorf("Error hashing password: %v", err)
		return err
	}

	// Update the password
	if err := s.db.Model(&user).Update("password_hash", hashedPassword).Error; err != nil {
		logrus.Errorf("Error updating password: %v", err)
		return err
	}

	return nil
}

// CreateOperatorForUser creates operator record for a user
func (s *UserService) CreateOperatorForUser(userID int, operatorData map[string]interface{}) error {
	// First get the user to access their email
	userWithOperator, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	user := userWithOperator.User

	// Convert map to struct
	operator := models.Operator{
		ID: userID, // user_id in operator table is the primary key
	}

	// Map the data
	if operatorCode, ok := operatorData["operator_code"].(string); ok && operatorCode != "" {
		operator.OperatorCode = operatorCode
	} else {
		// Auto-generate operator code if not provided
		timestamp := time.Now().Unix()
		rolePrefix := "OP"
		if user.Role == "admin" {
			rolePrefix = "AD"
		} else if user.Role == "supervisor" {
			rolePrefix = "SV"
		}
		operator.OperatorCode = fmt.Sprintf("%s%d", rolePrefix, timestamp)
	}

	if rankID, ok := operatorData["rank_id"]; ok {
		switch v := rankID.(type) {
		case float64:
			operator.RankID = int(v)
		case int:
			operator.RankID = v
		default:
			return errors.New("rank_id must be a number")
		}
	} else {
		return errors.New("rank_id is required")
	}

	if firstName, ok := operatorData["first_name"].(string); ok {
		operator.FirstName = firstName
	} else {
		return errors.New("first_name is required")
	}

	if lastName, ok := operatorData["last_name"].(string); ok {
		operator.LastName = lastName
	} else {
		return errors.New("last_name is required")
	}

	// For email, use operatorData email if provided, otherwise use user's email
	if email, ok := operatorData["email"].(string); ok && email != "" {
		operator.Email = email
	} else {
		operator.Email = user.Email // Use user's email as default
	}

	if phone, ok := operatorData["phone"].(string); ok {
		operator.Phone = phone
	}

	if unitID, ok := operatorData["unit_id"]; ok {
		switch v := unitID.(type) {
		case float64:
			operator.UnitID = int(v)
		case int:
			operator.UnitID = v
		default:
			return errors.New("unit_id must be a number")
		}
	} else {
		return errors.New("unit_id is required")
	}

	if stationID, ok := operatorData["station_id"]; ok {
		switch v := stationID.(type) {
		case float64:
			operator.StationID = int(v)
		case int:
			operator.StationID = v
		default:
			return errors.New("station_id must be a number")
		}
	} else {
		return errors.New("station_id is required")
	}

	if authorityLevel, ok := operatorData["authority_level"].(string); ok {
		operator.AuthorityLevel = models.AuthorityLevel(authorityLevel)
	} else {
		operator.AuthorityLevel = models.AuthorityLow // default
	}

	if shiftStart, ok := operatorData["shift_start"].(string); ok {
		operator.ShiftStart = shiftStart
	}

	if shiftEnd, ok := operatorData["shift_end"].(string); ok {
		operator.ShiftEnd = shiftEnd
	}

	if notes, ok := operatorData["notes"].(string); ok {
		operator.Notes = notes
	}

	// Set default status
	operator.Status = models.StatusActive

	// Create the operator record
	if err := s.db.Create(&operator).Error; err != nil {
		logrus.Errorf("Error creating operator: %v", err)
		return err
	}

	return nil
}

// GetUnits gets all units for dropdown selection
func (s *UserService) GetUnits() ([]models.Unit, error) {
	var units []models.Unit

	if err := s.db.Order("unit_name ASC").Find(&units).Error; err != nil {
		logrus.Errorf("Error getting units: %v", err)
		return nil, err
	}

	return units, nil
}

// GetStations gets all stations for dropdown selection
func (s *UserService) GetStations() ([]models.Station, error) {
	var stations []models.Station

	if err := s.db.Order("station_name ASC").Find(&stations).Error; err != nil {
		logrus.Errorf("Error getting stations: %v", err)
		return nil, err
	}

	return stations, nil
}

// UpdateUserProfile updates current user's profile (different from admin UpdateUser)
func (s *UserService) UpdateUserProfile(userID int, username, email, oldPassword, newPassword string) error {
	// Get current user
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Check if username is already taken (if being changed)
	if username != "" && username != user.Username {
		var existingUser models.User
		if err := s.db.Where("username = ? AND id != ?", username, userID).First(&existingUser).Error; err == nil {
			return errors.New("username is already taken")
		}
		user.Username = username
	}

	// Check if email is already taken (if being changed)
	if email != "" && email != user.Email {
		var existingUser models.User
		if err := s.db.Where("email = ? AND id != ?", email, userID).First(&existingUser).Error; err == nil {
			return errors.New("email is already taken")
		}
		user.Email = email
	}

	// Handle password change
	if newPassword != "" {
		// Verify old password
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
			return errors.New("current password is incorrect")
		}

		// Hash new password
		hashedPassword, err := utils.HashPassword(newPassword)
		if err != nil {
			logrus.Errorf("Error hashing password: %v", err)
			return err
		}
		user.PasswordHash = hashedPassword
	}

	// Update user
	user.UpdatedAt = time.Now()
	if err := s.db.Save(&user).Error; err != nil {
		logrus.Errorf("Error updating user profile: %v", err)
		return err
	}

	return nil
} 