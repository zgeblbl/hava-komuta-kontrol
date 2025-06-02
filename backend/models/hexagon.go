package models

import (
	"time"
)

type Hexagon struct {
	ID              int       `gorm:"primaryKey;column:id" json:"id"`
	CenterLatitude  float64   `gorm:"column:center_latitude;not null" json:"center_latitude"`
	CenterLongitude float64   `gorm:"column:center_longitude;not null" json:"center_longitude"`
	Radius          float64   `gorm:"column:radius;not null" json:"radius"`
	GridReference   string    `gorm:"column:grid_reference" json:"grid_reference"`
	ElevationMin    float64   `gorm:"column:elevation_min" json:"elevation_min"`
	ElevationMax    float64   `gorm:"column:elevation_max" json:"elevation_max"`
	TerrainType     string    `gorm:"column:terrain_type" json:"terrain_type"`
	CreatedAt       time.Time `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
}

func (Hexagon) TableName() string {
	return "hexagons"
} 