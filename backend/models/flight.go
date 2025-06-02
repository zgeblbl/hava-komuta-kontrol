package models

import (
	"time"
)

type Flight struct {
	ID                    int           `gorm:"primaryKey;column:id" json:"id"`
	FlightNumber          string        `gorm:"column:flight_number;not null" json:"flight_number"`
	FlightPlanID          int           `gorm:"column:flight_plan_id" json:"flight_plan_id"`
	PilotID               *int          `gorm:"column:pilot_id" json:"pilot_id"`
	CoPilotID             *int          `gorm:"column:co_pilot_id" json:"co_pilot_id"`
	Status                FlightStatus  `gorm:"column:status;default:'PLANNED'" json:"status"`
	ScheduledDepartureTime *time.Time   `gorm:"column:scheduled_departure_time" json:"scheduled_departure_time"`
	ScheduledArrivalTime  *time.Time    `gorm:"column:scheduled_arrival_time" json:"scheduled_arrival_time"`
	ActualDepartureTime   *time.Time    `gorm:"column:actual_departure_time" json:"actual_departure_time"`
	ActualArrivalTime     *time.Time    `gorm:"column:actual_arrival_time" json:"actual_arrival_time"`
	EstimatedArrivalTime  *time.Time    `gorm:"column:estimated_arrival_time" json:"estimated_arrival_time"`
	ActualFuelUsed        float64       `gorm:"column:actual_fuel_used" json:"actual_fuel_used"`
	MaxAltitudeReached    float64       `gorm:"column:max_altitude_reached" json:"max_altitude_reached"`
	DistanceTraveled      float64       `gorm:"column:distance_traveled" json:"distance_traveled"`
	MissionStatus         MissionStatus `gorm:"column:mission_status;default:'PENDING'" json:"mission_status"`
	WeatherCondition      string        `gorm:"column:weather_condition" json:"weather_condition"`
	FlightDuration        *int          `gorm:"column:flight_duration" json:"flight_duration"` // in minutes
	Delay                 *int          `gorm:"column:delay" json:"delay"` // in minutes
	DelayReason           string        `gorm:"column:delay_reason" json:"delay_reason"`
	Notes                 string        `gorm:"column:notes" json:"notes"`
	Priority              int           `gorm:"column:priority;default:1" json:"priority"` // 1=Low, 2=Medium, 3=High, 4=Critical
	IsEmergency           bool          `gorm:"column:is_emergency;default:false" json:"is_emergency"`
	CreatedBy             int           `gorm:"column:created_by" json:"created_by"`
	UpdatedBy             *int          `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt             time.Time     `gorm:"column:created_at;default:current_timestamp" json:"created_at"`
	UpdatedAt             time.Time     `gorm:"column:updated_at;default:current_timestamp" json:"updated_at"`
	
	// Relationships
	FlightPlan    FlightPlan    `gorm:"foreignKey:FlightPlanID" json:"flight_plan,omitempty"`
	Pilot         *Operator     `gorm:"foreignKey:PilotID" json:"pilot,omitempty"`
	CoPilot       *Operator     `gorm:"foreignKey:CoPilotID" json:"co_pilot,omitempty"`
	Creator       Operator      `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Updater       *Operator     `gorm:"foreignKey:UpdatedBy" json:"updater,omitempty"`
	FlightPoints  []FlightPoint `gorm:"foreignKey:FlightID" json:"flight_points,omitempty"`
}

func (Flight) TableName() string {
	return "flights"
}

// Flight status constants
type FlightStatus string

const (
	FlightStatusPlanned     FlightStatus = "PLANNED"
	FlightStatusScheduled   FlightStatus = "SCHEDULED"
	FlightStatusBoarding    FlightStatus = "BOARDING"
	FlightStatusReady       FlightStatus = "READY"
	FlightStatusTaxiing     FlightStatus = "TAXIING"
	FlightStatusTakeoff     FlightStatus = "TAKEOFF"
	FlightStatusInFlight    FlightStatus = "IN_FLIGHT"
	FlightStatusLanding     FlightStatus = "LANDING"
	FlightStatusLanded      FlightStatus = "LANDED"
	FlightStatusCompleted   FlightStatus = "COMPLETED"
	FlightStatusCancelled   FlightStatus = "CANCELLED"
	FlightStatusDelayed     FlightStatus = "DELAYED"
	FlightStatusDiverted    FlightStatus = "DIVERTED"
	FlightStatusEmergency   FlightStatus = "EMERGENCY"
	FlightStatusAborted     FlightStatus = "ABORTED"
	FlightStatusApproved    FlightStatus = "APPROVED"  // For flight plans
	FlightStatusActive      FlightStatus = "ACTIVE"    // Alternative for in-flight
)

// Priority levels
const (
	PriorityLow      = 1
	PriorityMedium   = 2
	PriorityHigh     = 3
	PriorityCritical = 4
)

// Helper methods
func (f *Flight) GetPriorityText() string {
	switch f.Priority {
	case PriorityLow:
		return "Düşük"
	case PriorityMedium:
		return "Orta"
	case PriorityHigh:
		return "Yüksek"
	case PriorityCritical:
		return "Kritik"
	default:
		return "Belirsiz"
	}
}

func (f *Flight) GetStatusText() string {
	switch f.Status {
	case FlightStatusPlanned:
		return "Planlandı"
	case FlightStatusScheduled:
		return "Zamanlandı"
	case FlightStatusBoarding:
		return "Binme"
	case FlightStatusReady:
		return "Hazır"
	case FlightStatusTaxiing:
		return "Taksi"
	case FlightStatusTakeoff:
		return "Kalkış"
	case FlightStatusInFlight:
		return "Uçuşta"
	case FlightStatusLanding:
		return "İniş"
	case FlightStatusLanded:
		return "İndi"
	case FlightStatusCompleted:
		return "Tamamlandı"
	case FlightStatusCancelled:
		return "İptal"
	case FlightStatusDelayed:
		return "Gecikti"
	case FlightStatusDiverted:
		return "Yönlendirildi"
	case FlightStatusEmergency:
		return "Acil Durum"
	case FlightStatusAborted:
		return "Durduruldu"
	case FlightStatusApproved:
		return "Onaylandı"
	case FlightStatusActive:
		return "Aktif"
	default:
		return string(f.Status)
	}
}

func (f *Flight) CanBeStarted() bool {
	return f.Status == FlightStatusPlanned || f.Status == FlightStatusScheduled || f.Status == FlightStatusReady
}

func (f *Flight) CanBeCompleted() bool {
	return f.Status == FlightStatusInFlight || f.Status == FlightStatusLanding || f.Status == FlightStatusLanded
}

func (f *Flight) CanBeCancelled() bool {
	return f.Status != FlightStatusCompleted && f.Status != FlightStatusCancelled && f.Status != FlightStatusAborted
} 