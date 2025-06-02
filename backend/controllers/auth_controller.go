package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"komutakontrol/config"
	"komutakontrol/services"
)

// AuthController handles authentication related routes
type AuthController struct {
	authService *services.AuthService
	logService  *services.LogService
	config      *config.Config
}

// NewAuthController creates a new AuthController
func NewAuthController(config *config.Config) *AuthController {
	return &AuthController{
		authService: services.NewAuthService(config),
		logService:  services.NewLogService(),
		config:      config,
	}
}

// Register handles user registration
func (c *AuthController) Register(ctx *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role" binding:"required,oneof=admin user"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.authService.RegisterUser(input.Username, input.Email, input.Password, input.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	c.logService.LogAction(0, "REGISTER", input.Email)

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

// Login handles both admin and regular user login
func (c *AuthController) Login(ctx *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
		UserType string `json:"userType" binding:"required,oneof=admin user"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		logrus.Errorf("Login validation error: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logrus.Infof("Login attempt - Email: %s, UserType: %s", input.Email, input.UserType)

	token, expiresAt, user, err := c.authService.LoginUser(input.Email, input.Password)
	if err != nil {
		logrus.Errorf("Login failed for email %s: %v", input.Email, err)
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if user has admin role when admin login is requested
	if input.UserType == "admin" && user.Role != "admin" {
		logrus.Errorf("Unauthorized admin access attempt by user %s with role %s", input.Email, user.Role)
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	// Log the action
	c.logService.LogAction(user.ID, "LOGIN", input.Email)
	logrus.Infof("Login successful for user %s with role %s", input.Email, user.Role)

	ctx.JSON(http.StatusOK, gin.H{
		"token":      token,
		"expires_at": expiresAt,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
		"userType": input.UserType,
	})
}

// OperatorLogin handles operator login
func (c *AuthController) OperatorLogin(ctx *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, expiresAt, operator, err := c.authService.LoginOperator(input.Email, input.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Log the action
	c.logService.LogAction(0, "OPERATOR_LOGIN", input.Email)

	ctx.JSON(http.StatusOK, gin.H{
		"token":      token,
		"expires_at": expiresAt,
		"operator": gin.H{
			"id":              operator.ID,
			"operator_code":   operator.OperatorCode,
			"name":            operator.FirstName + " " + operator.LastName,
			"email":           operator.Email,
			"authority_level": operator.AuthorityLevel,
			"unit_id":         operator.UnitID,
			"station_id":      operator.StationID,
		},
	})
}

// ValidateToken handles token validation
func (c *AuthController) ValidateToken(ctx *gin.Context) {
	var input struct {
		Token string `json:"token" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims, err := c.authService.ValidateToken(input.Token)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if token is expired
	if claims.ExpiresAt != nil {
		expiresAt := claims.ExpiresAt.Time
		if time.Now().After(expiresAt) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"valid": true,
		"user_id": claims.UserID,
		"role": claims.Role,
	})
}

// RegisterRoutes registers the routes for the AuthController
func (c *AuthController) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", c.Register)
		auth.POST("/login", c.Login)
		auth.POST("/operator/login", c.OperatorLogin)
		auth.POST("/validate", c.ValidateToken)
	}
} 