package models

import (
	"time"
)

type Unit struct {
	ID           int       `gorm:"primaryKey;column:unit_id" json:"unit_id"`
	UnitName     string    `gorm:"column:unit_name;unique;not null" json:"unit_name"`
	UnitCode     string    `gorm:"column:unit_code;unique;not null" json:"unit_code"`
	ParentUnitID *int      `gorm:"column:parent_unit_id" json:"parent_unit_id"`
	Description  string    `gorm:"column:description" json:"description"`
	CreatedAt    time.Time `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	ParentUnit   *Unit     `gorm:"foreignKey:ParentUnitID" json:"parent_unit,omitempty"`
	ChildUnits   []Unit    `gorm:"foreignKey:ParentUnitID" json:"child_units,omitempty"`
	Stations     []Station `gorm:"foreignKey:UnitID" json:"stations,omitempty"`
	Operators    []Operator `gorm:"foreignKey:UnitID" json:"operators,omitempty"`
}

func (Unit) TableName() string {
	return "unit"
} 