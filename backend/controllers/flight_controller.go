package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/services"
)

// FlightController handles flight related routes
type FlightController struct {
	flightService *services.FlightService
	logService    *services.LogService
	config        *config.Config
}

// NewFlightController creates a new FlightController
func NewFlightController(config *config.Config) *FlightController {
	return &FlightController{
		flightService: services.NewFlightService(),
		logService:    services.NewLogService(),
		config:        config,
	}
}

// GetFlights handles getting all flights with filtering
func (c *FlightController) GetFlights(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	pageSizeStr := ctx.DefaultQuery("page_size", "10")
	status := ctx.Query("status")
	priority := ctx.Query("priority")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	flights, count, err := c.flightService.GetFlights(page, pageSize, status, priority)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Uçuşlar alınırken hata oluştu: " + err.Error(),
			"code":  "GET_FLIGHTS_ERROR",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_FLIGHTS", "readonly")

	ctx.JSON(http.StatusOK, gin.H{
		"flights": flights,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetFlight handles getting a flight by ID
func (c *FlightController) GetFlight(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Geçersiz uçuş ID'si",
			"code":  "INVALID_FLIGHT_ID",
		})
		return
	}

	flight, err := c.flightService.GetFlightByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "bulunamadı") {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
				"code":  "FLIGHT_NOT_FOUND",
			})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Uçuş alınırken hata oluştu: " + err.Error(),
				"code":  "GET_FLIGHT_ERROR",
			})
		}
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_FLIGHT", idStr)

	ctx.JSON(http.StatusOK, gin.H{"flight": flight})
}

// GetActiveFlights handles getting all active flights
func (c *FlightController) GetActiveFlights(ctx *gin.Context) {
	flights, err := c.flightService.GetActiveFlights()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Aktif uçuşlar alınırken hata oluştu: " + err.Error(),
			"code":  "GET_ACTIVE_FLIGHTS_ERROR",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_ACTIVE_FLIGHTS", "readonly")

	ctx.JSON(http.StatusOK, gin.H{
		"flights": flights,
		"count":   len(flights),
	})
}

// GetFlightStats handles getting flight statistics
func (c *FlightController) GetFlightStats(ctx *gin.Context) {
	stats, err := c.flightService.GetFlightStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Uçuş istatistikleri alınırken hata oluştu: " + err.Error(),
			"code":  "GET_FLIGHT_STATS_ERROR",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_FLIGHT_STATS", "readonly")

	ctx.JSON(http.StatusOK, gin.H{"stats": stats})
}

// RegisterRoutes registers the routes for the FlightController (readonly only)
func (c *FlightController) RegisterRoutes(router *gin.RouterGroup) {
	flights := router.Group("/flights")
	flights.Use(middlewares.AuthMiddleware(c.config))
	{
		// Read-only operations for admin
		flights.GET("", c.GetFlights)
		flights.GET("/active", c.GetActiveFlights)
		flights.GET("/stats", c.GetFlightStats)
		flights.GET("/:id", c.GetFlight)
	}
} 