package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/models"
	"komutakontrol/services"
)

// OperatorController handles operator related routes
type OperatorController struct {
	operatorService *services.OperatorService
	logService      *services.LogService
	config          *config.Config
}

// NewOperatorController creates a new OperatorController
func NewOperatorController(config *config.Config) *OperatorController {
	return &OperatorController{
		operatorService: services.NewOperatorService(),
		logService:      services.NewLogService(),
		config:          config,
	}
}

// GetOperators handles getting all operators
func (c *OperatorController) GetOperators(ctx *gin.Context) {
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

	operators, count, err := c.operatorService.GetOperators(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_OPERATORS", "")

	ctx.JSON(http.StatusOK, gin.H{
		"operators": operators,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetOperator handles getting an operator by ID
func (c *OperatorController) GetOperator(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid operator ID"})
		return
	}

	operator, err := c.operatorService.GetOperatorByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_OPERATOR", idStr)

	ctx.JSON(http.StatusOK, gin.H{"operator": operator})
}

// CreateOperator handles creating a new operator
func (c *OperatorController) CreateOperator(ctx *gin.Context) {
	var input struct {
		OperatorCode    string `json:"operator_code" binding:"required"`
		RankID          int    `json:"rank_id" binding:"required"`
		FirstName       string `json:"first_name" binding:"required"`
		LastName        string `json:"last_name" binding:"required"`
		Email           string `json:"email" binding:"required,email"`
		Phone           string `json:"phone"`
		UnitID          int    `json:"unit_id" binding:"required"`
		StationID       int    `json:"station_id" binding:"required"`
		AuthorityLevel  string `json:"authority_level" binding:"required,oneof=LOW MEDIUM HIGH TOP"`
		ShiftStart      string `json:"shift_start"`
		ShiftEnd        string `json:"shift_end"`
		ProfilePhotoURL string `json:"profile_photo_url"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse shift times
	var shiftStart, shiftEnd time.Time
	var err error

	if input.ShiftStart != "" {
		shiftStart, err = time.Parse(time.RFC3339, input.ShiftStart)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift start time format. Use ISO 8601 (RFC3339)."})
			return
		}
	}

	if input.ShiftEnd != "" {
		shiftEnd, err = time.Parse(time.RFC3339, input.ShiftEnd)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift end time format. Use ISO 8601 (RFC3339)."})
			return
		}
	}

	authorityLevel := models.AuthorityLevel(input.AuthorityLevel)

	operator, err := c.operatorService.CreateOperator(
		input.OperatorCode,
		input.RankID,
		input.FirstName,
		input.LastName,
		input.Email,
		input.Phone,
		input.UnitID,
		input.StationID,
		authorityLevel,
		shiftStart,
		shiftEnd,
		input.ProfilePhotoURL,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "CREATE_OPERATOR", operator.Email)

	ctx.JSON(http.StatusCreated, gin.H{
		"message":  "Operator created successfully",
		"operator": operator,
	})
}

// UpdateOperator handles updating an operator
func (c *OperatorController) UpdateOperator(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid operator ID"})
		return
	}

	var input struct {
		OperatorCode    string `json:"operator_code"`
		RankID          int    `json:"rank_id"`
		FirstName       string `json:"first_name"`
		LastName        string `json:"last_name"`
		Email           string `json:"email" binding:"omitempty,email"`
		Phone           string `json:"phone"`
		UnitID          int    `json:"unit_id"`
		StationID       int    `json:"station_id"`
		AuthorityLevel  string `json:"authority_level" binding:"omitempty,oneof=LOW MEDIUM HIGH TOP"`
		Status          string `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE SUSPENDED"`
		ShiftStart      string `json:"shift_start"`
		ShiftEnd        string `json:"shift_end"`
		ProfilePhotoURL string `json:"profile_photo_url"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})

	if input.OperatorCode != "" {
		updates["operator_code"] = input.OperatorCode
	}
	if input.RankID != 0 {
		updates["rank_id"] = input.RankID
	}
	if input.FirstName != "" {
		updates["first_name"] = input.FirstName
	}
	if input.LastName != "" {
		updates["last_name"] = input.LastName
	}
	if input.Email != "" {
		updates["email"] = input.Email
	}
	if input.Phone != "" {
		updates["phone"] = input.Phone
	}
	if input.UnitID != 0 {
		updates["unit_id"] = input.UnitID
	}
	if input.StationID != 0 {
		updates["station_id"] = input.StationID
	}
	if input.AuthorityLevel != "" {
		updates["authority_level"] = input.AuthorityLevel
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}
	if input.ProfilePhotoURL != "" {
		updates["profile_photo_url"] = input.ProfilePhotoURL
	}

	// Parse shift times
	if input.ShiftStart != "" {
		shiftStart, err := time.Parse(time.RFC3339, input.ShiftStart)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift start time format. Use ISO 8601 (RFC3339)."})
			return
		}
		updates["shift_start"] = shiftStart
	}

	if input.ShiftEnd != "" {
		shiftEnd, err := time.Parse(time.RFC3339, input.ShiftEnd)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift end time format. Use ISO 8601 (RFC3339)."})
			return
		}
		updates["shift_end"] = shiftEnd
	}

	if len(updates) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	if err := c.operatorService.UpdateOperator(id, updates); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "UPDATE_OPERATOR", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "Operator updated successfully"})
}

// DeleteOperator handles deleting an operator
func (c *OperatorController) DeleteOperator(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid operator ID"})
		return
	}

	if err := c.operatorService.DeleteOperator(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "DELETE_OPERATOR", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "Operator deleted successfully"})
}

// GetOperatorsByUnit handles getting operators by unit ID
func (c *OperatorController) GetOperatorsByUnit(ctx *gin.Context) {
	unitIDStr := ctx.Param("unit_id")
	unitID, err := strconv.Atoi(unitIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid unit ID"})
		return
	}

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

	operators, count, err := c.operatorService.GetOperatorsByUnit(unitID, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_OPERATORS_BY_UNIT", unitIDStr)

	ctx.JSON(http.StatusOK, gin.H{
		"operators": operators,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetOperatorsByStation handles getting operators by station ID
func (c *OperatorController) GetOperatorsByStation(ctx *gin.Context) {
	stationIDStr := ctx.Param("station_id")
	stationID, err := strconv.Atoi(stationIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid station ID"})
		return
	}

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

	operators, count, err := c.operatorService.GetOperatorsByStation(stationID, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_OPERATORS_BY_STATION", stationIDStr)

	ctx.JSON(http.StatusOK, gin.H{
		"operators": operators,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// RegisterRoutes registers the routes for the OperatorController
func (c *OperatorController) RegisterRoutes(router *gin.RouterGroup) {
	operators := router.Group("/operators")
	operators.Use(middlewares.AuthMiddleware(c.config))
	{
		operators.GET("", c.GetOperators)
		operators.GET("/:id", c.GetOperator)
		operators.POST("", middlewares.AdminMiddleware(), c.CreateOperator)
		operators.PUT("/:id", middlewares.AdminMiddleware(), c.UpdateOperator)
		operators.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteOperator)
		operators.GET("/unit/:unit_id", c.GetOperatorsByUnit)
		operators.GET("/station/:station_id", c.GetOperatorsByStation)
	}
} 