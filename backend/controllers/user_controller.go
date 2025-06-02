package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"komutakontrol/config"
	"komutakontrol/middlewares"
	"komutakontrol/services"
)

// UserController handles user related routes
type UserController struct {
	userService *services.UserService
	logService  *services.LogService
	config      *config.Config
}

// NewUserController creates a new UserController
func NewUserController(config *config.Config) *UserController {
	return &UserController{
		userService: services.NewUserService(),
		logService:  services.NewLogService(),
		config:      config,
	}
}

// GetUsers handles getting all users
func (c *UserController) GetUsers(ctx *gin.Context) {
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

	users, count, err := c.userService.GetUsers(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_USERS", "")

	ctx.JSON(http.StatusOK, gin.H{
		"users": users,
		"meta": gin.H{
			"page":       page,
			"page_size":  pageSize,
			"total":      count,
			"total_page": (count + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetUser handles getting a user by ID
func (c *UserController) GetUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	userWithOperator, err := c.userService.GetUserByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_USER", idStr)

	ctx.JSON(http.StatusOK, gin.H{"user": userWithOperator})
}

// CreateUser handles creating a new user
func (c *UserController) CreateUser(ctx *gin.Context) {
	var input struct {
		Username     string                 `json:"username" binding:"required"`
		Email        string                 `json:"email" binding:"required,email"`
		Password     string                 `json:"password" binding:"required,min=6"`
		Role         string                 `json:"role" binding:"required,oneof=admin user operator supervisor"`
		OperatorInfo map[string]interface{} `json:"operatorInfo,omitempty"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create user
	user, err := c.userService.CreateUser(input.Username, input.Email, input.Password, input.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If role requires operator info and operatorInfo is provided, create operator record
	requiresOperatorInfo := input.Role == "operator" || input.Role == "admin" || input.Role == "supervisor"
	if requiresOperatorInfo && input.OperatorInfo != nil {
		// Create operator record
		err = c.userService.CreateOperatorForUser(user.ID, input.OperatorInfo)
		if err != nil {
			// If operator creation fails, we should rollback user creation
			c.userService.DeleteUser(user.ID)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create operator info: " + err.Error()})
			return
		}
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "CREATE_USER", user.Email)

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

// UpdateUser handles updating a user
func (c *UserController) UpdateUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input struct {
		Username string `json:"username"`
		Email    string `json:"email" binding:"omitempty,email"`
		Role     string `json:"role" binding:"omitempty,oneof=admin user operator supervisor"`
		IsActive *bool  `json:"is_active"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if input.Username != "" {
		updates["username"] = input.Username
	}
	if input.Email != "" {
		updates["email"] = input.Email
	}
	if input.Role != "" {
		updates["role"] = input.Role
	}
	if input.IsActive != nil {
		updates["is_active"] = *input.IsActive
	}

	if len(updates) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	if err := c.userService.UpdateUser(id, updates); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "UPDATE_USER", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// DeleteUser handles deleting a user
func (c *UserController) DeleteUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := c.userService.DeleteUser(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "DELETE_USER", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// ChangePassword handles changing a user's password
func (c *UserController) ChangePassword(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=6"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.userService.ChangePassword(id, input.CurrentPassword, input.NewPassword); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "CHANGE_PASSWORD", idStr)

	ctx.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// GetUnits handles getting all units for dropdown selections
func (c *UserController) GetUnits(ctx *gin.Context) {
	units, err := c.userService.GetUnits()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_UNITS", "")

	ctx.JSON(http.StatusOK, gin.H{"units": units})
}

// GetStations handles getting all stations for dropdown selections
func (c *UserController) GetStations(ctx *gin.Context) {
	stations, err := c.userService.GetStations()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	userID, _ := ctx.Get("userID")
	c.logService.LogAction(userID.(int), "GET_STATIONS", "")

	ctx.JSON(http.StatusOK, gin.H{"stations": stations})
}

// GetProfile handles getting current user's profile
func (c *UserController) GetProfile(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userWithOperator, err := c.userService.GetUserByID(userID.(int))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Format dates for frontend
	profile := map[string]interface{}{
		"id":       userWithOperator.User.ID,
		"username": userWithOperator.User.Username,
		"email":    userWithOperator.User.Email,
		"role":     userWithOperator.User.Role,
		"is_active": userWithOperator.User.IsActive,
		"created_at": userWithOperator.User.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	if !userWithOperator.User.LastLogin.IsZero() {
		profile["last_login"] = userWithOperator.User.LastLogin.Format("2006-01-02 15:04:05")
	} else {
		profile["last_login"] = "Hiç giriş yapılmadı"
	}

	// Add operator info if exists with formatted data
	if userWithOperator.Operator != nil {
		operator := userWithOperator.Operator
		operatorInfo := map[string]interface{}{
			"operator_code":    operator.OperatorCode,
			"rank_id":         operator.RankID,
			"first_name":      operator.FirstName,
			"last_name":       operator.LastName,
			"full_name":       operator.FirstName + " " + operator.LastName,
			"email":           operator.Email,
			"phone":           operator.Phone,
			"status":          operator.Status,
			"authority_level": operator.AuthorityLevel,
			"shift_start":     operator.ShiftStart,
			"shift_end":       operator.ShiftEnd,
			"profile_photo_url": operator.ProfilePhotoURL,
			"notes":           operator.Notes,
			"created_at":      operator.CreatedAt.Format("2006-01-02 15:04:05"),
			"updated_at":      operator.UpdatedAt.Format("2006-01-02 15:04:05"),
		}

		if operator.LastActive != nil {
			operatorInfo["last_active"] = operator.LastActive.Format("2006-01-02 15:04:05")
		} else {
			operatorInfo["last_active"] = "Hiç aktif olmadı"
		}

		// Add unit information
		if operator.Unit.ID != 0 {
			operatorInfo["unit"] = map[string]interface{}{
				"unit_id":     operator.Unit.ID,
				"unit_name":   operator.Unit.UnitName,
				"unit_code":   operator.Unit.UnitCode,
				"description": operator.Unit.Description,
			}
		}

		// Add station information
		if operator.Station.ID != 0 {
			operatorInfo["station"] = map[string]interface{}{
				"station_id":   operator.Station.ID,
				"station_name": operator.Station.StationName,
				"station_code": operator.Station.StationCode,
				"latitude":     operator.Station.Latitude,
				"longitude":    operator.Station.Longitude,
				"elevation":    operator.Station.Elevation,
				"status":       operator.Station.Status,
			}
		}

		profile["operator"] = operatorInfo
	}

	// Log the action
	c.logService.LogAction(userID.(int), "GET_PROFILE", "")

	ctx.JSON(http.StatusOK, profile)
}

// UpdateProfile handles updating current user's profile
func (c *UserController) UpdateProfile(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Username    string `json:"username"`
		Email       string `json:"email" binding:"omitempty,email"`
		OldPassword string `json:"oldPassword,omitempty"`
		NewPassword string `json:"newPassword,omitempty"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If password change is requested, validate it
	if input.NewPassword != "" {
		if input.OldPassword == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Old password is required to change password"})
			return
		}
		if len(input.NewPassword) < 6 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "New password must be at least 6 characters"})
			return
		}
	}

	// Update profile via user service
	err := c.userService.UpdateUserProfile(userID.(int), input.Username, input.Email, input.OldPassword, input.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	c.logService.LogAction(userID.(int), "UPDATE_PROFILE", "")

	ctx.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// RegisterRoutes registers the routes for the UserController
func (c *UserController) RegisterRoutes(router *gin.RouterGroup) {
	users := router.Group("/users")
	users.Use(middlewares.AuthMiddleware(c.config))
	{
		users.GET("", middlewares.AdminMiddleware(), c.GetUsers)
		users.GET("/:id", c.GetUser)
		users.POST("", middlewares.AdminMiddleware(), c.CreateUser)
		users.PUT("/:id", middlewares.AdminMiddleware(), c.UpdateUser)
		users.DELETE("/:id", middlewares.AdminMiddleware(), c.DeleteUser)
		users.POST("/:id/change-password", c.ChangePassword)
	}

	// Profile routes for current user
	profile := router.Group("/profile")
	profile.Use(middlewares.AuthMiddleware(c.config))
	{
		profile.GET("", c.GetProfile)
		profile.PUT("", c.UpdateProfile)
	}

	// Units and Stations endpoints
	router.GET("/units", middlewares.AuthMiddleware(c.config), c.GetUnits)
	router.GET("/stations", middlewares.AuthMiddleware(c.config), c.GetStations)
} 