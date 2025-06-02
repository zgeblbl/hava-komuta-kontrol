package database

import (
	"io/ioutil"
	"strings"

	"komutakontrol/config"
	"komutakontrol/models"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB *gorm.DB
)

// Initialize initializes the database connection
func Initialize(config *config.Config) error {
	var err error

	// Configure GORM logger
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(config.Database.GetDSN()), gormConfig)
	if err != nil {
		return err
	}

	logrus.Info("Connected to database")

	// Check if database has been initialized
	tablesExist, err := checkDatabaseInitialized()
	if err != nil {
		logrus.Warnf("Database check failed: %v, assuming initial setup needed", err)
	}

	// If tables don't exist, try to initialize from SQL file
	if !tablesExist {
		if err := initializeFromSQL(); err != nil {
			logrus.Warnf("Failed to initialize from SQL file: %v, falling back to auto-migration", err)
			
			// Auto-migrate the models as a fallback option
			if err := migrateModels(); err != nil {
				return err
			}
		} else {
			logrus.Info("Database initialized from SQL file successfully")
		}
	} else {
		logrus.Info("Database tables already exist, skipping initialization")
	}

	return nil
}

// initializeFromSQL initializes the database from init.sql file
func initializeFromSQL() error {
	// Read SQL file
	content, err := ioutil.ReadFile("init.sql")
	if err != nil {
		return err
	}

	// Split SQL file into statements
	statements := strings.Split(string(content), ";")

	// Execute each statement
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}

		if err := DB.Exec(stmt).Error; err != nil {
			logrus.Warnf("Error executing SQL statement: %v", err)
			// Continue execution, as some statements might fail (e.g., DROP TABLE IF EXISTS)
		}
	}

	return nil
}

// checkDatabaseInitialized checks if the database has been initialized with tables
func checkDatabaseInitialized() (bool, error) {
	// Check if the users table exists as a basic test
	var count int64
	err := DB.Table("information_schema.tables").
		Where("table_schema = ?", "public").
		Where("table_name = ?", "users").
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}

// migrateModels auto-migrates the models to keep them in sync with the database
func migrateModels() error {
	logrus.Info("Auto-migrating database models")

	// Disable constraints during migration to avoid errors with non-existent constraints
	db := DB.Session(&gorm.Session{
		DisableNestedTransaction: true,
	})

	err := db.AutoMigrate(
		&models.User{},
		&models.UserSession{},
		&models.Log{},
		&models.Unit{},
		&models.Station{},
		&models.Operator{},
		&models.Airport{},
		&models.MissionType{},
		&models.Aircraft{},
		&models.AircraftState{},
		&models.AircraftHistory{},
		&models.WeatherCondition{},
		&models.FlightPlan{},
		&models.Flight{},
		&models.FlightPoint{},
		&models.Hexagon{},
	)

	if err != nil {
		logrus.Errorf("Error auto-migrating models: %v", err)
		return err
	}

	return nil
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
	return DB
} 