package models

import (
	"time"
)

type FlightPlan struct {
	ID                   int          `gorm:"primaryKey;column:id" json:"id"`
	FlightNumber         string       `gorm:"column:flight_number;unique;not null" json:"flight_number"`
	AircraftID           int          `gorm:"column:aircraft_id" json:"aircraft_id"`
	MissionTypeID        int          `gorm:"column:mission_type_id" json:"mission_type_id"`
	DepartureAirportID   int          `gorm:"column:departure_airport_id" json:"departure_airport_id"`
	ArrivalAirportID     int          `gorm:"column:arrival_airport_id" json:"arrival_airport_id"`
	AlternateAirportID   *int         `gorm:"column:alternate_airport_id" json:"alternate_airport_id"`
	PlannedDepartureTime time.Time    `gorm:"column:planned_departure_time" json:"planned_departure_time"`
	EstimatedArrivalTime time.Time    `gorm:"column:estimated_arrival_time" json:"estimated_arrival_time"`
	FlightLevel          float64      `gorm:"column:flight_level" json:"flight_level"`
	RouteDescription     string       `gorm:"column:route_description" json:"route_description"`
	FuelPlanned          float64      `gorm:"column:fuel_planned" json:"fuel_planned"`
	Status               FlightStatus `gorm:"column:status;default:'PLANNED'" json:"status"`
	CreatedBy            int          `gorm:"column:created_by" json:"created_by"`
	ApprovedBy           *int         `gorm:"column:approved_by" json:"approved_by"`
	CreatedAt            time.Time    `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt            time.Time    `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	
	// Relationships
	Aircraft          Aircraft     `gorm:"foreignKey:AircraftID" json:"aircraft,omitempty"`
	MissionType       MissionType  `gorm:"foreignKey:MissionTypeID" json:"mission_type,omitempty"`
	DepartureAirport  Airport      `gorm:"foreignKey:DepartureAirportID" json:"departure_airport,omitempty"`
	ArrivalAirport    Airport      `gorm:"foreignKey:ArrivalAirportID" json:"arrival_airport,omitempty"`
	AlternateAirport  *Airport     `gorm:"foreignKey:AlternateAirportID" json:"alternate_airport,omitempty"`
	Creator           Operator     `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Approver          *Operator    `gorm:"foreignKey:ApprovedBy" json:"approver,omitempty"`
	Flight            *Flight      `gorm:"foreignKey:FlightPlanID" json:"flight,omitempty"`
}

func (FlightPlan) TableName() string {
	return "flight_plans"
} 