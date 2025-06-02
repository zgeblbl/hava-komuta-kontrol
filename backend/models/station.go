package models

import (
	"time"
)

type Station struct {
	ID          int       `gorm:"primaryKey;column:station_id" json:"station_id"`
	UnitID      int       `gorm:"column:unit_id;not null" json:"unit_id"`
	StationName string    `gorm:"column:station_name;not null" json:"station_name"`
	StationCode string    `gorm:"column:station_code;unique;not null" json:"station_code"`
	Latitude    float64   `gorm:"column:latitude" json:"latitude"`
	Longitude   float64   `gorm:"column:longitude" json:"longitude"`
	Elevation   float64   `gorm:"column:elevation" json:"elevation"`
	Status      bool      `gorm:"column:status;default:true" json:"status"`
	CreatedAt   time.Time `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	Unit        Unit      `gorm:"foreignKey:UnitID" json:"-"`
	Operators   []Operator `gorm:"foreignKey:StationID" json:"operators,omitempty"`
}

func (Station) TableName() string {
	return "station"
} 