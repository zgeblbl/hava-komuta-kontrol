package models

import (
	"time"
)

type MissionType struct {
	ID          int         `gorm:"primaryKey;column:id" json:"id"`
	Name        string      `gorm:"column:name;not null" json:"name"`
	Code        string      `gorm:"column:code;unique;not null" json:"code"`
	Description string      `gorm:"column:description" json:"description"`
	CreatedAt   time.Time   `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	FlightPlans []FlightPlan `gorm:"foreignKey:MissionTypeID" json:"-"`
}

func (MissionType) TableName() string {
	return "mission_types"
} 