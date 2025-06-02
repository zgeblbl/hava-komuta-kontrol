package models

import (
	"time"
)

type FlightPoint struct {
	ID                   int        `gorm:"primaryKey;column:id" json:"id"`
	FlightID             int        `gorm:"column:flight_id" json:"flight_id"`
	SequenceNumber       int        `gorm:"column:sequence_number" json:"sequence_number"`
	Latitude             float64    `gorm:"column:latitude;not null" json:"latitude"`
	Longitude            float64    `gorm:"column:longitude;not null" json:"longitude"`
	Altitude             float64    `gorm:"column:altitude" json:"altitude"`
	Speed                float64    `gorm:"column:speed" json:"speed"`
	Heading              float64    `gorm:"column:heading" json:"heading"`
	EstimatedTimeOfArrival *time.Time `gorm:"column:estimated_time_of_arrival" json:"estimated_time_of_arrival"`
	ActualTimeOfArrival  *time.Time  `gorm:"column:actual_time_of_arrival" json:"actual_time_of_arrival"`
	PointType            string     `gorm:"column:point_type" json:"point_type"`
	Description          string     `gorm:"column:description" json:"description"`
	CreatedAt            time.Time  `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	Flight               Flight     `gorm:"foreignKey:FlightID" json:"-"`
}

func (FlightPoint) TableName() string {
	return "flight_points"
} 