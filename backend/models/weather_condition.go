package models

import (
	"time"
)

type WeatherCondition struct {
	ID            int           `gorm:"primaryKey;column:id" json:"id"`
	AirportID     int           `gorm:"column:airport_id" json:"airport_id"`
	Temperature   float64       `gorm:"column:temperature" json:"temperature"`
	Pressure      float64       `gorm:"column:pressure" json:"pressure"`
	Humidity      float64       `gorm:"column:humidity" json:"humidity"`
	WindSpeed     float64       `gorm:"column:wind_speed" json:"wind_speed"`
	WindDirection float64       `gorm:"column:wind_direction" json:"wind_direction"`
	Visibility    float64       `gorm:"column:visibility" json:"visibility"`
	CloudBase     float64       `gorm:"column:cloud_base" json:"cloud_base"`
	Precipitation float64       `gorm:"column:precipitation" json:"precipitation"`
	Status        WeatherStatus `gorm:"column:status" json:"status"`
	Timestamp     time.Time     `gorm:"column:timestamp;default:current_timestamp" json:"timestamp"`
	Airport       Airport       `gorm:"foreignKey:AirportID" json:"-"`
}

func (WeatherCondition) TableName() string {
	return "weather_conditions"
} 