package models

import (
	"time"
)

type Operator struct {
	ID              int            `gorm:"primaryKey;column:user_id" json:"user_id"`
	OperatorCode    string         `gorm:"column:operator_code;unique;not null" json:"operator_code"`
	RankID          int            `gorm:"column:rank_id;not null" json:"rank_id"`
	FirstName       string         `gorm:"column:first_name;not null" json:"first_name"`
	LastName        string         `gorm:"column:last_name;not null" json:"last_name"`
	Email           string         `gorm:"column:email;unique;not null" json:"email"`
	Phone           string         `gorm:"column:phone" json:"phone"`
	Status          UserStatus     `gorm:"column:status;default:'ACTIVE';not null" json:"status"`
	UnitID          int            `gorm:"column:unit_id;not null" json:"unit_id"`
	StationID       int            `gorm:"column:station_id;not null" json:"station_id"`
	AuthorityLevel  AuthorityLevel `gorm:"column:authority_level;not null" json:"authority_level"`
	ShiftStart      string         `gorm:"column:shift_start" json:"shift_start"`
	ShiftEnd        string         `gorm:"column:shift_end" json:"shift_end"`
	ProfilePhotoURL string         `gorm:"column:profile_photo_url" json:"profile_photo_url"`
	LastActive      *time.Time     `gorm:"column:last_active" json:"last_active"`
	Notes           string         `gorm:"column:notes" json:"notes"`
	CreatedAt       time.Time      `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	Unit            Unit           `gorm:"foreignKey:UnitID" json:"Unit,omitempty"`
	Station         Station        `gorm:"foreignKey:StationID" json:"Station,omitempty"`
	CreatedFlightPlans  []FlightPlan `gorm:"foreignKey:CreatedBy" json:"-"`
	ApprovedFlightPlans []FlightPlan `gorm:"foreignKey:ApprovedBy" json:"-"`
	AircraftHistory     []AircraftHistory `gorm:"foreignKey:OperatorID" json:"-"`
}

func (Operator) TableName() string {
	return "operator"
} 