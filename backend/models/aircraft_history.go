package models

import (
	"time"
)

type AircraftHistory struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	AircraftID  int       `gorm:"column:aircraft_id" json:"aircraft_id"`
	EventType   string    `gorm:"column:event_type;not null" json:"event_type"`
	Description string    `gorm:"column:description" json:"description"`
	LocationID  *int      `gorm:"column:location" json:"location_id"`
	OperatorID  *int      `gorm:"column:operator_id" json:"operator_id"`
	Timestamp   time.Time `gorm:"column:timestamp;default:current_timestamp" json:"timestamp"`
	Aircraft    Aircraft  `gorm:"foreignKey:AircraftID" json:"-"`
	Location    *Airport  `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	Operator    *Operator `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

func (AircraftHistory) TableName() string {
	return "aircraft_history"
} 