package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"komutakontrol/config"
	"komutakontrol/controllers"
)

// SetupRouter sets up the router with all the routes
func SetupRouter(config *config.Config) *gin.Engine {
	// Set Gin mode
	gin.SetMode(config.Server.GinMode)

	// Initialize router
	router := gin.Default()

	// CORS ayarları
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Register controllers
		authController := controllers.NewAuthController(config)
		userController := controllers.NewUserController(config)
		adminController := controllers.NewAdminController(config)
		operatorController := controllers.NewOperatorController(config)
		aircraftController := controllers.NewAircraftController(config)
		airportController := controllers.NewAirportController(config)
		flightController := controllers.NewFlightController(config)
		missionTypeController := controllers.NewMissionTypeController(config)
		weatherController := controllers.NewWeatherController(config)
		flightPlanController := controllers.NewFlightPlanController(config)
		hexagonController := controllers.NewHexagonController(config)

		// Register routes
		authController.RegisterRoutes(api)
		userController.RegisterRoutes(api)
		adminController.RegisterRoutes(api)
		operatorController.RegisterRoutes(api)
		aircraftController.RegisterRoutes(api)
		airportController.RegisterRoutes(api)
		flightController.RegisterRoutes(api)
		
		// Register new routes
		missionTypeController.SetupRoutes(api)
		weatherController.SetupRoutes(api)
		flightPlanController.SetupRoutes(api)
		hexagonController.SetupRoutes(api)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	return router
} 