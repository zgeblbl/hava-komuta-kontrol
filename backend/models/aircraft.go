package models

import (
	"time"
)

type Aircraft struct {
	ID                int            `gorm:"primaryKey;column:id" json:"id"`
	Code              string         `gorm:"column:code;unique;not null" json:"code"`
	TailNumber        string         `gorm:"column:tail_number;unique;not null" json:"tail_number"`
	Model             string         `gorm:"column:model;not null" json:"model"`
	Manufacturer      string         `gorm:"column:manufacturer" json:"manufacturer"`
	YearManufactured  int            `gorm:"column:year_manufactured" json:"year_manufactured"`
	Owner             string         `gorm:"column:owner" json:"owner"`
	MaxSpeed          float64        `gorm:"column:max_speed" json:"max_speed"`
	CruiseSpeed       float64        `gorm:"column:cruise_speed" json:"cruise_speed"`
	MaxAltitude       float64        `gorm:"column:max_altitude" json:"max_altitude"`
	Range             float64        `gorm:"column:range" json:"range"`
	FuelCapacity      float64        `gorm:"column:fuel_capacity" json:"fuel_capacity"`
	EmptyWeight       float64        `gorm:"column:empty_weight" json:"empty_weight"`
	MaxTakeoffWeight  float64        `gorm:"column:max_takeoff_weight" json:"max_takeoff_weight"`
	Status            AircraftStatus `gorm:"column:status;default:'STANDBY'" json:"status"`
	CurrentLocationID *int           `gorm:"column:current_location" json:"current_location_id"`
	MaintenanceDueDate *time.Time    `gorm:"column:maintenance_due_date" json:"maintenance_due_date"`
	LastMaintenanceDate *time.Time   `gorm:"column:last_maintenance_date" json:"last_maintenance_date"`
	FlightHours       float64        `gorm:"column:flight_hours;default:0" json:"flight_hours"`
	CreatedAt         time.Time      `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	
	// Relationships
	CurrentLocation   *Airport         `gorm:"foreignKey:CurrentLocationID" json:"current_location,omitempty"`
	CurrentState      *AircraftState   `gorm:"foreignKey:AircraftID" json:"current_state,omitempty"`
	History           []AircraftHistory `gorm:"foreignKey:AircraftID" json:"history,omitempty"`
	FlightPlans       []FlightPlan      `gorm:"foreignKey:AircraftID" json:"flight_plans,omitempty"`
}

func (Aircraft) TableName() string {
	return "aircrafts"
} 