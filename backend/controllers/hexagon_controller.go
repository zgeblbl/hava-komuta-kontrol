package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/services"
)

// HexagonController handles hexagon related endpoints
type HexagonController struct {
	service *services.HexagonService
	config  *config.Config
}

// NewHexagonController creates a new HexagonController
func NewHexagonController(config *config.Config) *HexagonController {
	return &HexagonController{
		service: services.NewHexagonService(),
		config:  config,
	}
}

// GetHexagons handles GET /api/hexagons
func (c *HexagonController) GetHexagons(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	// Check if terrain type filter is provided
	terrainType := ctx.Query("terrain_type")
	if terrainType != "" {
		// Get hexagons by terrain type
		hexagons, total, err := c.service.GetHexagonsByTerrainType(terrainType, page, pageSize)
		if err != nil {
			logrus.Errorf("Error getting hexagons by terrain type: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get hexagons"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": hexagons,
			"meta": gin.H{
				"page":         page,
				"page_size":    pageSize,
				"total":        total,
				"terrain_type": terrainType,
			},
		})
		return
	}

	// Check if bounding box filter is provided
	minLatStr := ctx.Query("min_lat")
	minLonStr := ctx.Query("min_lon")
	maxLatStr := ctx.Query("max_lat")
	maxLonStr := ctx.Query("max_lon")
	if minLatStr != "" && minLonStr != "" && maxLatStr != "" && maxLonStr != "" {
		// Parse bounding box parameters
		minLat, err := strconv.ParseFloat(minLatStr, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid min_lat parameter"})
			return
		}
		minLon, err := strconv.ParseFloat(minLonStr, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid min_lon parameter"})
			return
		}
		maxLat, err := strconv.ParseFloat(maxLatStr, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid max_lat parameter"})
			return
		}
		maxLon, err := strconv.ParseFloat(maxLonStr, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid max_lon parameter"})
			return
		}

		// Get hexagons within bounding box
		hexagons, total, err := c.service.GetHexagonsInBoundingBox(minLat, minLon, maxLat, maxLon, page, pageSize)
		if err != nil {
			logrus.Errorf("Error getting hexagons within bounding box: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get hexagons"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"data": hexagons,
			"meta": gin.H{
				"page":      page,
				"page_size": pageSize,
				"total":     total,
				"min_lat":   minLat,
				"min_lon":   minLon,
				"max_lat":   maxLat,
				"max_lon":   maxLon,
			},
		})
		return
	}

	// Get all hexagons
	hexagons, total, err := c.service.GetHexagons(page, pageSize)
	if err != nil {
		logrus.Errorf("Error getting hexagons: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get hexagons"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": hexagons,
		"meta": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	})
}

// GetHexagonByID handles GET /api/hexagons/:id
func (c *HexagonController) GetHexagonByID(ctx *gin.Context) {
	// Parse hexagon ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid hexagon ID"})
		return
	}

	// Get hexagon
	hexagon, err := c.service.GetHexagonByID(id)
	if err != nil {
		logrus.Errorf("Error getting hexagon: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Hexagon not found"})
		return
	}

	ctx.JSON(http.StatusOK, hexagon)
}

// GetHexagonByGridReference handles GET /api/hexagons/grid/:grid_reference
func (c *HexagonController) GetHexagonByGridReference(ctx *gin.Context) {
	// Parse grid reference
	gridReference := ctx.Param("grid_reference")
	if gridReference == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Grid reference is required"})
		return
	}

	// Get hexagon
	hexagon, err := c.service.GetHexagonByGridReference(gridReference)
	if err != nil {
		logrus.Errorf("Error getting hexagon by grid reference: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Hexagon not found"})
		return
	}

	ctx.JSON(http.StatusOK, hexagon)
}

// CreateHexagon handles POST /api/hexagons
func (c *HexagonController) CreateHexagon(ctx *gin.Context) {
	// Parse request body
	var req struct {
		CenterLatitude  float64 `json:"center_latitude" binding:"required"`
		CenterLongitude float64 `json:"center_longitude" binding:"required"`
		Radius          float64 `json:"radius" binding:"required"`
		GridReference   string  `json:"grid_reference" binding:"required"`
		ElevationMin    float64 `json:"elevation_min"`
		ElevationMax    float64 `json:"elevation_max"`
		TerrainType     string  `json:"terrain_type"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Create hexagon
	hexagon, err := c.service.CreateHexagon(
		req.CenterLatitude,
		req.CenterLongitude,
		req.Radius,
		req.GridReference,
		req.ElevationMin,
		req.ElevationMax,
		req.TerrainType,
	)

	if err != nil {
		logrus.Errorf("Error creating hexagon: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create hexagon"})
		return
	}

	ctx.JSON(http.StatusCreated, hexagon)
}

// UpdateHexagon handles PUT /api/hexagons/:id
func (c *HexagonController) UpdateHexagon(ctx *gin.Context) {
	// Parse hexagon ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid hexagon ID"})
		return
	}

	// Parse request body
	var req struct {
		CenterLatitude  float64 `json:"center_latitude"`
		CenterLongitude float64 `json:"center_longitude"`
		Radius          float64 `json:"radius"`
		GridReference   string  `json:"grid_reference"`
		ElevationMin    float64 `json:"elevation_min"`
		ElevationMax    float64 `json:"elevation_max"`
		TerrainType     string  `json:"terrain_type"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Prepare data for update
	data := make(map[string]interface{})
	if req.CenterLatitude != 0 {
		data["center_latitude"] = req.CenterLatitude
	}
	if req.CenterLongitude != 0 {
		data["center_longitude"] = req.CenterLongitude
	}
	if req.Radius != 0 {
		data["radius"] = req.Radius
	}
	if req.GridReference != "" {
		data["grid_reference"] = req.GridReference
	}
	if req.ElevationMin != 0 {
		data["elevation_min"] = req.ElevationMin
	}
	if req.ElevationMax != 0 {
		data["elevation_max"] = req.ElevationMax
	}
	if req.TerrainType != "" {
		data["terrain_type"] = req.TerrainType
	}

	// Update hexagon
	if err := c.service.UpdateHexagon(id, data); err != nil {
		logrus.Errorf("Error updating hexagon: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hexagon"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Hexagon updated successfully"})
}

// DeleteHexagon handles DELETE /api/hexagons/:id
func (c *HexagonController) DeleteHexagon(ctx *gin.Context) {
	// Parse hexagon ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid hexagon ID"})
		return
	}

	// Delete hexagon
	if err := c.service.DeleteHexagon(id); err != nil {
		logrus.Errorf("Error deleting hexagon: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete hexagon"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Hexagon deleted successfully"})
}

// SetupRoutes sets up the hexagon routes
func (c *HexagonController) SetupRoutes(router *gin.RouterGroup) {
	hexagonRoutes := router.Group("/hexagons")
	hexagonRoutes.Use(middlewares.AuthMiddleware(c.config))
	{
		hexagonRoutes.GET("", c.GetHexagons)
		hexagonRoutes.GET("/:id", c.GetHexagonByID)
		hexagonRoutes.GET("/grid/:grid_reference", c.GetHexagonByGridReference)
		hexagonRoutes.POST("", middlewares.AdminMiddleware(), c.CreateHexagon)
		hexagonRoutes.PUT("/:id", middlewares.AdminMiddleware(), c.UpdateHexagon)
		hexagonRoutes.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteHexagon)
	}
} 