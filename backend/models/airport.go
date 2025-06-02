package models

import (
	"time"
)

type Airport struct {
	ID               int           `gorm:"primaryKey;column:id" json:"id"`
	Name             string        `gorm:"column:name;not null" json:"name"`
	IcaoCode         string        `gorm:"column:icao_code;unique" json:"icao_code"`
	IataCode         string        `gorm:"column:iata_code;unique" json:"iata_code"`
	Latitude         float64       `gorm:"column:latitude;not null" json:"latitude"`
	Longitude        float64       `gorm:"column:longitude;not null" json:"longitude"`
	Elevation        float64       `gorm:"column:elevation" json:"elevation"`
	City             string        `gorm:"column:city" json:"city"`
	Country          string        `gorm:"column:country" json:"country"`
	AirStatusCelcius int           `gorm:"column:air_status_celcius" json:"air_status_celcius"`
	RunwayLength     float64       `gorm:"column:runway_length" json:"runway_length"`
	IsMilitary       bool          `gorm:"column:is_military;default:false" json:"is_military"`
	Status           bool          `gorm:"column:status;default:true" json:"status"`
	WeatherStatus    WeatherStatus `gorm:"column:weather_status" json:"weather_status"`
	CreatedAt        time.Time     `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt        time.Time     `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	
	// Relationships
	OriginFlightPlans []FlightPlan `gorm:"foreignKey:DepartureAirportID" json:"-"`
	ArrivalFlightPlans []FlightPlan `gorm:"foreignKey:ArrivalAirportID" json:"-"`
	AlternateFlightPlans []FlightPlan `gorm:"foreignKey:AlternateAirportID" json:"-"`
	WeatherConditions []WeatherCondition `gorm:"foreignKey:AirportID" json:"-"`
	BasedAircrafts []Aircraft `gorm:"foreignKey:CurrentLocation" json:"-"`
	AircraftHistory []AircraftHistory `gorm:"foreignKey:Location" json:"-"`
}

func (Airport) TableName() string {
	return "airports"
} 