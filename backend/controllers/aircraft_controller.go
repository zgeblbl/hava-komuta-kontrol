package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/services"
)

// AircraftController handles aircraft related routes
type AircraftController struct {
	aircraftService *services.AircraftService
	logService      *services.LogService
	config          *config.Config
}

// NewAircraftController creates a new AircraftController
func NewAircraftController(config *config.Config) *AircraftController {
	return &AircraftController{
		aircraftService: services.NewAircraftService(),
		logService:      services.NewLogService(),
		config:          config,
	}
}

// GetAircrafts handles getting all aircrafts
func (c *AircraftController) GetAircrafts(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	pageSizeStr := ctx.DefaultQuery("page_size", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	aircrafts, count, err := c.aircraftService.GetAircrafts(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Uçaklar alınırken hata oluştu: " + err.Error(),
			"code":  "GET_AIRCRAFTS_ERROR",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRCRAFTS", "readonly")

	ctx.JSON(http.StatusOK, gin.H{
		"aircrafts": aircrafts,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetAircraft handles getting an aircraft by ID
func (c *AircraftController) GetAircraft(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Geçersiz uçak ID'si",
			"code":  "INVALID_AIRCRAFT_ID",
		})
		return
	}

	aircraft, err := c.aircraftService.GetAircraftByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Uçak bulunamadı: " + err.Error(),
			"code":  "AIRCRAFT_NOT_FOUND",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRCRAFT", idStr)

	ctx.JSON(http.StatusOK, gin.H{"aircraft": aircraft})
}

// GetAircraftByCode handles getting an aircraft by code
func (c *AircraftController) GetAircraftByCode(ctx *gin.Context) {
	code := ctx.Param("code")

	aircraft, err := c.aircraftService.GetAircraftByCode(code)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Uçak bulunamadı: " + err.Error(),
			"code":  "AIRCRAFT_NOT_FOUND",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRCRAFT_BY_CODE", code)

	ctx.JSON(http.StatusOK, gin.H{"aircraft": aircraft})
}

// GetAircraftState handles getting aircraft state
func (c *AircraftController) GetAircraftState(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Geçersiz uçak ID'si",
			"code":  "INVALID_AIRCRAFT_ID",
		})
		return
	}

	aircraft, err := c.aircraftService.GetAircraftByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Uçak bulunamadı: " + err.Error(),
			"code":  "AIRCRAFT_NOT_FOUND",
		})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRCRAFT_STATE", idStr)

	ctx.JSON(http.StatusOK, gin.H{
		"aircraft": aircraft,
		"state": gin.H{
			"status":             aircraft.Status,
			"current_location":   aircraft.CurrentLocation,
			"last_updated":       aircraft.UpdatedAt,
		},
	})
}

// RegisterRoutes registers the routes for the AircraftController (readonly only)
func (c *AircraftController) RegisterRoutes(router *gin.RouterGroup) {
	aircrafts := router.Group("/aircrafts")
	aircrafts.Use(middlewares.AuthMiddleware(c.config))
	{
		// Read-only operations for admin
		aircrafts.GET("", c.GetAircrafts)
		aircrafts.GET("/:id", c.GetAircraft)
		aircrafts.GET("/code/:code", c.GetAircraftByCode)
		aircrafts.GET("/:id/state", c.GetAircraftState)
	}
} 