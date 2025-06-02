package models

import (
	"time"
)

type Log struct {
	ID               int       `gorm:"primaryKey;column:id" json:"id"`
	UserID           int       `gorm:"column:user_id" json:"user_id"`
	ActionType       string    `gorm:"column:action_type;not null" json:"action_type"`
	ActionDescription string   `gorm:"column:action_description" json:"action_description"`
	IPAddress        string    `gorm:"column:ip_address" json:"ip_address"`
	UserAgent        string    `gorm:"column:user_agent" json:"user_agent"`
	Timestamp        time.Time `gorm:"column:timestamp;default:current_timestamp" json:"timestamp"`
	User             User      `gorm:"foreignKey:UserID" json:"-"`
}

func (Log) TableName() string {
	return "logs"
} 