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

// FlightPlanController handles flight plan related endpoints
type FlightPlanController struct {
	service *services.FlightPlanService
	config  *config.Config
}

// NewFlightPlanController creates a new FlightPlanController
func NewFlightPlanController(config *config.Config) *FlightPlanController {
	return &FlightPlanController{
		service: services.NewFlightPlanService(),
		config:  config,
	}
}

// GetFlightPlans handles GET /api/flight-plans
func (c *FlightPlanController) GetFlightPlans(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	// Check if status filter is provided
	status := ctx.Query("status")
	if status != "" {
		// Get flight plans by status
		flightPlans, total, err := c.service.GetFlightPlansByStatus(models.FlightStatus(status), page, pageSize)
		if err != nil {
			logrus.Errorf("Error getting flight plans by status: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get flight plans"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": flightPlans,
			"meta": gin.H{
				"page":      page,
				"page_size": pageSize,
				"total":     total,
				"status":    status,
			},
		})
		return
	}

	// Check if aircraft filter is provided
	aircraftIDStr := ctx.Query("aircraft_id")
	if aircraftIDStr != "" {
		aircraftID, err := strconv.Atoi(aircraftIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid aircraft ID"})
			return
		}

		// Get flight plans by aircraft
		flightPlans, total, err := c.service.GetFlightPlansByAircraft(aircraftID, page, pageSize)
		if err != nil {
			logrus.Errorf("Error getting flight plans by aircraft: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get flight plans"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": flightPlans,
			"meta": gin.H{
				"page":        page,
				"page_size":   pageSize,
				"total":       total,
				"aircraft_id": aircraftID,
			},
		})
		return
	}

	// Check if date range filter is provided
	startDateStr := ctx.Query("start_date")
	endDateStr := ctx.Query("end_date")
	if startDateStr != "" && endDateStr != "" {
		// Parse date range parameters
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format (use YYYY-MM-DD)"})
			return
		}

		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format (use YYYY-MM-DD)"})
			return
		}

		// Add one day to end date to include the end date in the range
		endDate = endDate.Add(24 * time.Hour)

		// Get flight plans by date range
		flightPlans, total, err := c.service.GetFlightPlansByDateRange(startDate, endDate, page, pageSize)
		if err != nil {
			logrus.Errorf("Error getting flight plans by date range: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get flight plans"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": flightPlans,
			"meta": gin.H{
				"page":       page,
				"page_size":  pageSize,
				"total":      total,
				"start_date": startDateStr,
				"end_date":   endDateStr,
			},
		})
		return
	}

	// Get all flight plans
	flightPlans, total, err := c.service.GetFlightPlans(page, pageSize)
	if err != nil {
		logrus.Errorf("Error getting flight plans: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get flight plans"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": flightPlans,
		"meta": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	})
}

// GetFlightPlanByID handles GET /api/flight-plans/:id
func (c *FlightPlanController) GetFlightPlanByID(ctx *gin.Context) {
	// Parse flight plan ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flight plan ID"})
		return
	}

	// Get flight plan
	flightPlan, err := c.service.GetFlightPlanByID(id)
	if err != nil {
		logrus.Errorf("Error getting flight plan: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Flight plan not found"})
		return
	}

	ctx.JSON(http.StatusOK, flightPlan)
}

// GetFlightPlanByFlightNumber handles GET /api/flight-plans/number/:flight_number
func (c *FlightPlanController) GetFlightPlanByFlightNumber(ctx *gin.Context) {
	// Parse flight number
	flightNumber := ctx.Param("flight_number")
	if flightNumber == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Flight number is required"})
		return
	}

	// Get flight plan
	flightPlan, err := c.service.GetFlightPlanByFlightNumber(flightNumber)
	if err != nil {
		logrus.Errorf("Error getting flight plan by number: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Flight plan not found"})
		return
	}

	ctx.JSON(http.StatusOK, flightPlan)
}

// CreateFlightPlan handles POST /api/flight-plans
func (c *FlightPlanController) CreateFlightPlan(ctx *gin.Context) {
	// Parse request body
	var req struct {
		FlightNumber         string    `json:"flight_number" binding:"required"`
		AircraftID           int       `json:"aircraft_id" binding:"required"`
		MissionTypeID        int       `json:"mission_type_id" binding:"required"`
		DepartureAirportID   int       `json:"departure_airport_id" binding:"required"`
		ArrivalAirportID     int       `json:"arrival_airport_id" binding:"required"`
		AlternateAirportID   *int      `json:"alternate_airport_id"`
		PlannedDepartureTime time.Time `json:"planned_departure_time" binding:"required"`
		EstimatedArrivalTime time.Time `json:"estimated_arrival_time" binding:"required"`
		FlightLevel          float64   `json:"flight_level" binding:"required"`
		RouteDescription     string    `json:"route_description"`
		FuelPlanned          float64   `json:"fuel_planned" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get operator ID from context
	operatorID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// Create flight plan
	flightPlan, err := c.service.CreateFlightPlan(
		req.FlightNumber,
		req.AircraftID,
		req.MissionTypeID,
		req.DepartureAirportID,
		req.ArrivalAirportID,
		req.AlternateAirportID,
		req.PlannedDepartureTime,
		req.EstimatedArrivalTime,
		req.FlightLevel,
		req.FuelPlanned,
		req.RouteDescription,
		operatorID.(int),
	)

	if err != nil {
		logrus.Errorf("Error creating flight plan: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flight plan"})
		return
	}

	ctx.JSON(http.StatusCreated, flightPlan)
}

// UpdateFlightPlan handles PUT /api/flight-plans/:id
func (c *FlightPlanController) UpdateFlightPlan(ctx *gin.Context) {
	// Parse flight plan ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flight plan ID"})
		return
	}

	// Get the flight plan to check if it's editable
	flightPlan, err := c.service.GetFlightPlanByID(id)
	if err != nil {
		logrus.Errorf("Error getting flight plan: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Flight plan not found"})
		return
	}

	// Only allow updates to PLANNED flight plans
	if flightPlan.Status != models.FlightStatusPlanned {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Only PLANNED flight plans can be updated"})
		return
	}

	// Parse request body
	var req struct {
		FlightNumber         string    `json:"flight_number"`
		AircraftID           int       `json:"aircraft_id"`
		MissionTypeID        int       `json:"mission_type_id"`
		DepartureAirportID   int       `json:"departure_airport_id"`
		ArrivalAirportID     int       `json:"arrival_airport_id"`
		AlternateAirportID   *int      `json:"alternate_airport_id"`
		PlannedDepartureTime time.Time `json:"planned_departure_time"`
		EstimatedArrivalTime time.Time `json:"estimated_arrival_time"`
		FlightLevel          float64   `json:"flight_level"`
		RouteDescription     string    `json:"route_description"`
		FuelPlanned          float64   `json:"fuel_planned"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Prepare data for update
	data := make(map[string]interface{})
	if req.FlightNumber != "" {
		data["flight_number"] = req.FlightNumber
	}
	if req.AircraftID != 0 {
		data["aircraft_id"] = req.AircraftID
	}
	if req.MissionTypeID != 0 {
		data["mission_type_id"] = req.MissionTypeID
	}
	if req.DepartureAirportID != 0 {
		data["departure_airport_id"] = req.DepartureAirportID
	}
	if req.ArrivalAirportID != 0 {
		data["arrival_airport_id"] = req.ArrivalAirportID
	}
	if req.AlternateAirportID != nil {
		data["alternate_airport_id"] = req.AlternateAirportID
	}
	if !req.PlannedDepartureTime.IsZero() {
		data["planned_departure_time"] = req.PlannedDepartureTime
	}
	if !req.EstimatedArrivalTime.IsZero() {
		data["estimated_arrival_time"] = req.EstimatedArrivalTime
	}
	if req.FlightLevel != 0 {
		data["flight_level"] = req.FlightLevel
	}
	if req.RouteDescription != "" {
		data["route_description"] = req.RouteDescription
	}
	if req.FuelPlanned != 0 {
		data["fuel_planned"] = req.FuelPlanned
	}

	// Update flight plan
	if err := c.service.UpdateFlightPlan(id, data); err != nil {
		logrus.Errorf("Error updating flight plan: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update flight plan"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Flight plan updated successfully"})
}

// ApproveFlightPlan handles PUT /api/flight-plans/:id/approve
func (c *FlightPlanController) ApproveFlightPlan(ctx *gin.Context) {
	// Parse flight plan ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flight plan ID"})
		return
	}

	// Get operator ID from context
	operatorID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// Approve flight plan
	if err := c.service.ApproveFlightPlan(id, operatorID.(int)); err != nil {
		logrus.Errorf("Error approving flight plan: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Flight plan approved successfully"})
}

// CancelFlightPlan handles PUT /api/flight-plans/:id/cancel
func (c *FlightPlanController) CancelFlightPlan(ctx *gin.Context) {
	// Parse flight plan ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flight plan ID"})
		return
	}

	// Cancel flight plan
	if err := c.service.CancelFlightPlan(id); err != nil {
		logrus.Errorf("Error cancelling flight plan: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Flight plan cancelled successfully"})
}

// DeleteFlightPlan handles DELETE /api/flight-plans/:id
func (c *FlightPlanController) DeleteFlightPlan(ctx *gin.Context) {
	// Parse flight plan ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flight plan ID"})
		return
	}

	// Delete flight plan
	if err := c.service.DeleteFlightPlan(id); err != nil {
		logrus.Errorf("Error deleting flight plan: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Flight plan deleted successfully"})
}

// SetupRoutes sets up the flight plan routes
func (c *FlightPlanController) SetupRoutes(router *gin.RouterGroup) {
	flightPlanRoutes := router.Group("/flight-plans")
	flightPlanRoutes.Use(middlewares.AuthMiddleware(c.config))
	{
		flightPlanRoutes.GET("", c.GetFlightPlans)
		flightPlanRoutes.GET("/:id", c.GetFlightPlanByID)
		flightPlanRoutes.GET("/number/:flight_number", c.GetFlightPlanByFlightNumber)
		flightPlanRoutes.POST("", c.CreateFlightPlan)
		flightPlanRoutes.PUT("/:id", c.UpdateFlightPlan)
		flightPlanRoutes.PUT("/:id/approve", middlewares.AdminMiddleware(), c.ApproveFlightPlan)
		flightPlanRoutes.PUT("/:id/cancel", middlewares.AdminMiddleware(), c.CancelFlightPlan)
		flightPlanRoutes.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteFlightPlan)
	}
} 