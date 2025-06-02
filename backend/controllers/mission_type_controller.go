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

// MissionTypeController handles mission type related endpoints
type MissionTypeController struct {
	service *services.MissionTypeService
	config  *config.Config
}

// NewMissionTypeController creates a new MissionTypeController
func NewMissionTypeController(config *config.Config) *MissionTypeController {
	return &MissionTypeController{
		service: services.NewMissionTypeService(),
		config:  config,
	}
}

// GetMissionTypes handles GET /api/mission-types
func (c *MissionTypeController) GetMissionTypes(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	// Get mission types
	missionTypes, total, err := c.service.GetMissionTypes(page, pageSize)
	if err != nil {
		logrus.Errorf("Error getting mission types: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get mission types"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": missionTypes,
		"meta": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	})
}

// GetMissionTypeByID handles GET /api/mission-types/:id
func (c *MissionTypeController) GetMissionTypeByID(ctx *gin.Context) {
	// Parse mission type ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mission type ID"})
		return
	}

	// Get mission type
	missionType, err := c.service.GetMissionTypeByID(id)
	if err != nil {
		logrus.Errorf("Error getting mission type: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Mission type not found"})
		return
	}

	ctx.JSON(http.StatusOK, missionType)
}

// CreateMissionType handles POST /api/mission-types
func (c *MissionTypeController) CreateMissionType(ctx *gin.Context) {
	// Parse request body
	var req struct {
		Name        string `json:"name" binding:"required"`
		Code        string `json:"code" binding:"required"`
		Description string `json:"description"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Create mission type
	missionType, err := c.service.CreateMissionType(req.Name, req.Code, req.Description)
	if err != nil {
		logrus.Errorf("Error creating mission type: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create mission type"})
		return
	}

	ctx.JSON(http.StatusCreated, missionType)
}

// UpdateMissionType handles PUT /api/mission-types/:id
func (c *MissionTypeController) UpdateMissionType(ctx *gin.Context) {
	// Parse mission type ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mission type ID"})
		return
	}

	// Parse request body
	var req struct {
		Name        string `json:"name"`
		Code        string `json:"code"`
		Description string `json:"description"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Prepare data for update
	data := make(map[string]interface{})
	if req.Name != "" {
		data["name"] = req.Name
	}
	if req.Code != "" {
		data["code"] = req.Code
	}
	if req.Description != "" {
		data["description"] = req.Description
	}

	// Update mission type
	if err := c.service.UpdateMissionType(id, data); err != nil {
		logrus.Errorf("Error updating mission type: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update mission type"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Mission type updated successfully"})
}

// DeleteMissionType handles DELETE /api/mission-types/:id
func (c *MissionTypeController) DeleteMissionType(ctx *gin.Context) {
	// Parse mission type ID
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mission type ID"})
		return
	}

	// Delete mission type
	if err := c.service.DeleteMissionType(id); err != nil {
		logrus.Errorf("Error deleting mission type: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete mission type"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Mission type deleted successfully"})
}

// SetupRoutes sets up the mission type routes
func (c *MissionTypeController) SetupRoutes(router *gin.RouterGroup) {
	missionTypeRoutes := router.Group("/mission-types")
	missionTypeRoutes.Use(middlewares.AuthMiddleware(c.config))
	{
		missionTypeRoutes.GET("", c.GetMissionTypes)
		missionTypeRoutes.GET("/:id", c.GetMissionTypeByID)
		missionTypeRoutes.POST("", middlewares.AdminMiddleware(), c.CreateMissionType)
		missionTypeRoutes.PUT("/:id", middlewares.AdminMiddleware(), c.UpdateMissionType)
		missionTypeRoutes.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteMissionType)
	}
} 