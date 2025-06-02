package services

import (
    "komutakontrol/models"
    "komutakontrol/database"
    "golang.org/x/crypto/bcrypt"
    "errors"
    "gorm.io/gorm"
)

type AdminProfileUpdate struct {
    Username    string `json:"username"`
    Email       string `json:"email"`
    OldPassword string `json:"oldPassword,omitempty"`
    NewPassword string `json:"newPassword,omitempty"`
}

type AdminService struct {
    db *gorm.DB
}

func NewAdminService() *AdminService {
    return &AdminService{
        db: database.GetDB(),
    }
}

func (s *AdminService) GetAdminProfile(adminID int) (*models.User, error) {
    var admin models.User
    if err := s.db.First(&admin, adminID).Error; err != nil {
        return nil, err
    }
    return &admin, nil
}

func (s *AdminService) UpdateAdminProfile(adminID int, update *AdminProfileUpdate) (*models.User, error) {
    var admin models.User
    if err := s.db.First(&admin, adminID).Error; err != nil {
        return nil, err
    }

    // Check if username is already taken
    if update.Username != "" && update.Username != admin.Username {
        var existingUser models.User
        if err := s.db.Where("username = ? AND id != ?", update.Username, adminID).First(&existingUser).Error; err == nil {
            return nil, errors.New("username is already taken")
        }
        admin.Username = update.Username
    }

    // Check if email is already taken
    if update.Email != "" && update.Email != admin.Email {
        var existingUser models.User
        if err := s.db.Where("email = ? AND id != ?", update.Email, adminID).First(&existingUser).Error; err == nil {
            return nil, errors.New("email is already taken")
        }
        admin.Email = update.Email
    }

    // Handle password update
    if update.NewPassword != "" {
        // Verify old password
        if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(update.OldPassword)); err != nil {
            return nil, errors.New("invalid old password")
        }

        // Hash new password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(update.NewPassword), bcrypt.DefaultCost)
        if err != nil {
            return nil, err
        }
        admin.PasswordHash = string(hashedPassword)
    }

    // Save changes
    if err := s.db.Save(&admin).Error; err != nil {
        return nil, err
    }

    return &admin, nil
} 