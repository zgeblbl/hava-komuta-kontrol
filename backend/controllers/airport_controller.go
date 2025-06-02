package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/services"
)

// AirportController handles airport related routes
type AirportController struct {
	airportService *services.AirportService
	logService     *services.LogService
	config         *config.Config
}

// NewAirportController creates a new AirportController
func NewAirportController(config *config.Config) *AirportController {
	return &AirportController{
		airportService: services.NewAirportService(),
		logService:     services.NewLogService(),
		config:         config,
	}
}

// GetAirports handles getting all airports
func (c *AirportController) GetAirports(ctx *gin.Context) {
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

	airports, count, err := c.airportService.GetAirports(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRPORTS", "")

	ctx.JSON(http.StatusOK, gin.H{
		"airports": airports,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetAirport handles getting an airport by ID
func (c *AirportController) GetAirport(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid airport ID"})
		return
	}

	airport, err := c.airportService.GetAirportByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRPORT", idStr)

	ctx.JSON(http.StatusOK, gin.H{"airport": airport})
}

// GetAirportByIcaoCode handles getting an airport by ICAO code
func (c *AirportController) GetAirportByIcaoCode(ctx *gin.Context) {
	icaoCode := ctx.Param("icao_code")

	airport, err := c.airportService.GetAirportByIcaoCode(icaoCode)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRPORT_BY_ICAO", icaoCode)

	ctx.JSON(http.StatusOK, gin.H{"airport": airport})
}

// CreateAirport handles creating a new airport
func (c *AirportController) CreateAirport(ctx *gin.Context) {
	var input struct {
		Name             string  `json:"name" binding:"required"`
		IcaoCode         string  `json:"icao_code"`
		Latitude         float64 `json:"latitude" binding:"required"`
		Longitude        float64 `json:"longitude" binding:"required"`
		City             string  `json:"city"`
		Country          string  `json:"country"`
		AirStatusCelcius int     `json:"air_status_celcius"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	airport, err := c.airportService.CreateAirport(
		input.Name,
		input.IcaoCode,
		input.Latitude,
		input.Longitude,
		input.City,
		input.Country,
		input.AirStatusCelcius,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "CREATE_AIRPORT", input.Name)

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Airport created successfully",
		"airport": airport,
	})
}

// UpdateAirport handles updating an airport
func (c *AirportController) UpdateAirport(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid airport ID"})
		return
	}

	var input struct {
		Name             string  `json:"name"`
		IcaoCode         string  `json:"icao_code"`
		Latitude         float64 `json:"latitude"`
		Longitude        float64 `json:"longitude"`
		City             string  `json:"city"`
		Country          string  `json:"country"`
		AirStatusCelcius int     `json:"air_status_celcius"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.IcaoCode != "" {
		updates["icao_code"] = input.IcaoCode
	}
	if input.Latitude != 0 {
		updates["latitude"] = input.Latitude
	}
	if input.Longitude != 0 {
		updates["longitude"] = input.Longitude
	}
	if input.City != "" {
		updates["city"] = input.City
	}
	if input.Country != "" {
		updates["country"] = input.Country
	}
	if input.AirStatusCelcius != 0 {
		updates["air_status_celcius"] = input.AirStatusCelcius
	}

	if len(updates) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	if err := c.airportService.UpdateAirport(id, updates); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "UPDATE_AIRPORT", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "Airport updated successfully"})
}

// DeleteAirport handles deleting an airport
func (c *AirportController) DeleteAirport(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid airport ID"})
		return
	}

	if err := c.airportService.DeleteAirport(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "DELETE_AIRPORT", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "Airport deleted successfully"})
}

// GetAirportsByCountry handles getting airports by country
func (c *AirportController) GetAirportsByCountry(ctx *gin.Context) {
	country := ctx.Param("country")

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

	airports, count, err := c.airportService.GetAirportsByCountry(country, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRPORTS_BY_COUNTRY", country)

	ctx.JSON(http.StatusOK, gin.H{
		"airports": airports,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetAirportsByCity handles getting airports by city
func (c *AirportController) GetAirportsByCity(ctx *gin.Context) {
	city := ctx.Param("city")

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

	airports, count, err := c.airportService.GetAirportsByCity(city, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_AIRPORTS_BY_CITY", city)

	ctx.JSON(http.StatusOK, gin.H{
		"airports": airports,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// RegisterRoutes registers the routes for the AirportController
func (c *AirportController) RegisterRoutes(router *gin.RouterGroup) {
	airports := router.Group("/airports")
	airports.Use(middlewares.AuthMiddleware(c.config))
	{
		airports.GET("", c.GetAirports)
		airports.GET("/:id", c.GetAirport)
		airports.GET("/icao/:icao_code", c.GetAirportByIcaoCode)
		airports.POST("", middlewares.AdminMiddleware(), c.CreateAirport)
		airports.PUT("/:id", middlewares.AdminMiddleware(), c.UpdateAirport)
		airports.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteAirport)
		airports.GET("/country/:country", c.GetAirportsByCountry)
		airports.GET("/city/:city", c.GetAirportsByCity)
	}
} 