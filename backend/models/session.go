package models

import (
	"time"
)

type UserSession struct {
	ID        int       `gorm:"primaryKey;column:id" json:"id"`
	UserID    int       `gorm:"column:user_id" json:"user_id"`
	Token     string    `gorm:"column:session_token;not null;unique" json:"token"`
	IPAddress string    `gorm:"column:ip_address" json:"ip_address"`
	UserAgent string    `gorm:"column:user_agent" json:"user_agent"`
	LoginTime time.Time `gorm:"column:login_time;default:current_timestamp" json:"login_time"`
	LogoutTime *time.Time `gorm:"column:logout_time" json:"logout_time"`
	IsActive  bool      `gorm:"column:is_active;default:true" json:"is_active"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
}

func (UserSession) TableName() string {
	return "user_sessions"
} 