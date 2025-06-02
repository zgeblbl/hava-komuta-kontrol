package models

// UserStatus defines the status of a user or operator
type UserStatus string

// AuthorityLevel defines the authority level of an operator
type AuthorityLevel string

// AircraftStatus defines the status of an aircraft
type AircraftStatus string

// WeatherStatus defines the status of weather conditions
type WeatherStatus string

// MissionStatus defines the status of a mission
type MissionStatus string

// Enum values for UserStatus
const (
	StatusActive    UserStatus = "ACTIVE"
	StatusInactive  UserStatus = "INACTIVE"
	StatusSuspended UserStatus = "SUSPENDED"
)

// Enum values for AuthorityLevel
const (
	AuthorityLow    AuthorityLevel = "LOW"
	AuthorityMedium AuthorityLevel = "MEDIUM"
	AuthorityHigh   AuthorityLevel = "HIGH"
	AuthorityTop    AuthorityLevel = "TOP"
)

// Enum values for AircraftStatus
const (
	AircraftStatusActive      AircraftStatus = "ACTIVE"
	AircraftStatusMaintenance AircraftStatus = "MAINTENANCE"
	AircraftStatusGrounded    AircraftStatus = "GROUNDED"
	AircraftStatusMission     AircraftStatus = "MISSION"
	AircraftStatusStandby     AircraftStatus = "STANDBY"
)

// Enum values for WeatherStatus
const (
	WeatherStatusClear   WeatherStatus = "CLEAR"
	WeatherStatusCloudy  WeatherStatus = "CLOUDY"
	WeatherStatusRainy   WeatherStatus = "RAINY"
	WeatherStatusStormy  WeatherStatus = "STORMY"
	WeatherStatusSnowy   WeatherStatus = "SNOWY"
	WeatherStatusFog     WeatherStatus = "FOG"
)

// Enum values for MissionStatus
const (
	MissionStatusPending    MissionStatus = "PENDING"
	MissionStatusInProgress MissionStatus = "IN_PROGRESS"
	MissionStatusCompleted  MissionStatus = "COMPLETED"
	MissionStatusAborted    MissionStatus = "ABORTED"
) 