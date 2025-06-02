package models

import (
	"time"
)

type User struct {
	ID           int           `gorm:"primaryKey;column:id" json:"id"`
	Username     string        `gorm:"column:username;unique;not null" json:"username"`
	Email        string        `gorm:"column:email;unique;not null" json:"email"`
	PasswordHash string        `gorm:"column:password_hash;not null" json:"-"`
	Role         string        `gorm:"column:role;check:role IN ('admin', 'user', 'supervisor', 'operator');not null" json:"role"`
	IsActive     bool          `gorm:"column:is_active;default:true" json:"is_active"`
	LastLogin    time.Time     `gorm:"column:last_login" json:"last_login"`
	CreatedAt    time.Time     `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt    time.Time     `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	Sessions     []UserSession `gorm:"foreignKey:UserID" json:"-"`
	Logs         []Log         `gorm:"foreignKey:UserID" json:"-"`
}

func (User) TableName() string {
	return "users"
}
