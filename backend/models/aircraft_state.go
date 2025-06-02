package models

import (
	"time"
)

type AircraftState struct {
	ID            int       `gorm:"primaryKey;column:id" json:"id"`
	AircraftID    int       `gorm:"column:aircraft_id" json:"aircraft_id"`
	Latitude      float64   `gorm:"column:latitude;not null" json:"latitude"`
	Longitude     float64   `gorm:"column:longitude;not null" json:"longitude"`
	Altitude      float64   `gorm:"column:altitude" json:"altitude"`
	Heading       float64   `gorm:"column:heading" json:"heading"`
	GroundSpeed   float64   `gorm:"column:ground_speed" json:"ground_speed"`
	VerticalSpeed float64   `gorm:"column:vertical_speed" json:"vertical_speed"`
	FuelLevel     float64   `gorm:"column:fuel_level" json:"fuel_level"`
	EngineStatus  bool      `gorm:"column:engine_status" json:"engine_status"`
	Temperature   float64   `gorm:"column:temperature" json:"temperature"`
	Pressure      float64   `gorm:"column:pressure" json:"pressure"`
	WindSpeed     float64   `gorm:"column:wind_speed" json:"wind_speed"`
	WindDirection float64   `gorm:"column:wind_direction" json:"wind_direction"`
	Timestamp     time.Time `gorm:"column:timestamp;default:current_timestamp" json:"timestamp"`
	Aircraft      Aircraft  `gorm:"foreignKey:AircraftID" json:"-"`
}

func (AircraftState) TableName() string {
	return "aircraft_state"
} 