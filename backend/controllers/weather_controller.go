package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/models"
	"komutakontrol/services"
)

// WeatherController handles weather condition related endpoints
type WeatherController struct {
	service *services.WeatherService
	config  *config.Config
}

// NewWeatherController creates a new WeatherController
func NewWeatherController(config *config.Config) *WeatherController {
	return &WeatherController{
		service: services.NewWeatherService(),
		config:  config,
	}
}

// GetWeatherConditions handles GET /api/weather
func (c *WeatherController) GetWeatherConditions(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	// Get weather conditions
	conditions, total, err := c.service.GetWeatherConditions(page, pageSize)
	if err != nil {
		logrus.Errorf("Error getting weather conditions: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get weather conditions"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": conditions,
		"meta": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	})
}

// GetWeatherConditionByID handles GET /api/weather/:id
func (c *WeatherController) GetWeatherConditionByID(ctx *gin.Context) {
	// Parse weather condition ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid weather condition ID"})
		return
	}

	// Get weather condition
	condition, err := c.service.GetWeatherConditionByID(id)
	if err != nil {
		logrus.Errorf("Error getting weather condition: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Weather condition not found"})
		return
	}

	ctx.JSON(http.StatusOK, condition)
}

// GetLatestWeatherByAirport handles GET /api/weather/airport/:id/latest
func (c *WeatherController) GetLatestWeatherByAirport(ctx *gin.Context) {
	// Parse airport ID
	airportID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid airport ID"})
		return
	}

	// Get latest weather condition
	condition, err := c.service.GetLatestWeatherByAirport(airportID)
	if err != nil {
		logrus.Errorf("Error getting latest weather condition: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Weather condition not found"})
		return
	}

	ctx.JSON(http.StatusOK, condition)
}

// CreateWeatherCondition handles POST /api/weather
func (c *WeatherController) CreateWeatherCondition(ctx *gin.Context) {
	// Parse request body
	var req struct {
		AirportID     int              `json:"airport_id" binding:"required"`
		Temperature   float64          `json:"temperature"`
		Pressure      float64          `json:"pressure"`
		Humidity      float64          `json:"humidity"`
		WindSpeed     float64          `json:"wind_speed"`
		WindDirection float64          `json:"wind_direction"`
		Visibility    float64          `json:"visibility"`
		CloudBase     float64          `json:"cloud_base"`
		Precipitation float64          `json:"precipitation"`
		Status        models.WeatherStatus `json:"status" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Create weather condition
	condition, err := c.service.CreateWeatherCondition(
		req.AirportID,
		req.Temperature,
		req.Pressure,
		req.Humidity,
		req.WindSpeed,
		req.WindDirection,
		req.Visibility,
		req.CloudBase,
		req.Precipitation,
		req.Status,
	)

	if err != nil {
		logrus.Errorf("Error creating weather condition: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create weather condition"})
		return
	}

	ctx.JSON(http.StatusCreated, condition)
}

// GetWeatherHistoryByAirport handles GET /api/weather/airport/:id/history
func (c *WeatherController) GetWeatherHistoryByAirport(ctx *gin.Context) {
	// Parse airport ID
	airportID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid airport ID"})
		return
	}

	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	// Check if time range parameters are provided
	startTimeStr := ctx.Query("start_time")
	endTimeStr := ctx.Query("end_time")

	if startTimeStr != "" && endTimeStr != "" {
		// Parse time range parameters
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format"})
			return
		}

		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format"})
			return
		}

		// Get weather history by time range
		conditions, err := c.service.GetWeatherHistoryTimeRange(airportID, startTime, endTime)
		if err != nil {
			logrus.Errorf("Error getting weather history: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get weather history"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": conditions,
			"meta": gin.H{
				"start_time": startTime,
				"end_time":   endTime,
				"count":      len(conditions),
			},
		})
		return
	}

	// Get weather history with pagination
	conditions, total, err := c.service.GetWeatherHistoryByAirport(airportID, page, pageSize)
	if err != nil {
		logrus.Errorf("Error getting weather history: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get weather history"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": conditions,
		"meta": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	})
}

// SetupRoutes sets up the weather routes
func (c *WeatherController) SetupRoutes(router *gin.RouterGroup) {
	weatherRoutes := router.Group("/weather")
	weatherRoutes.Use(middlewares.AuthMiddleware(c.config))
	{
		weatherRoutes.GET("", c.GetWeatherConditions)
		weatherRoutes.GET("/:id", c.GetWeatherConditionByID)
		weatherRoutes.POST("", middlewares.AdminMiddleware(), c.CreateWeatherCondition)
		weatherRoutes.GET("/airport/:id/latest", c.GetLatestWeatherByAirport)
		weatherRoutes.GET("/airport/:id/history", c.GetWeatherHistoryByAirport)
	}
} 