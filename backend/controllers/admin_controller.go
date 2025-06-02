package controllers

import (
    "github.com/gin-gonic/gin"
    "komutakontrol/config"
    "komutakontrol/services"
    "komutakontrol/middlewares"
    "net/http"
)

type AdminController struct {
    config  *config.Config
    service *services.AdminService
}

func NewAdminController(config *config.Config) *AdminController {
    return &AdminController{
        config:  config,
        service: services.NewAdminService(),
    }
}

func (ac *AdminController) GetProfile(c *gin.Context) {
    userID := c.GetInt("userID")
    if userID == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    admin, err := ac.service.GetAdminProfile(userID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
        return
    }

    // Remove sensitive information
    admin.PasswordHash = ""
    c.JSON(http.StatusOK, admin)
}

func (ac *AdminController) UpdateProfile(c *gin.Context) {
    userID := c.GetInt("userID")
    if userID == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var updateData services.AdminProfileUpdate
    if err := c.ShouldBindJSON(&updateData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    admin, err := ac.service.UpdateAdminProfile(userID, &updateData)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Remove sensitive information
    admin.PasswordHash = ""
    c.JSON(http.StatusOK, admin)
}

func (ac *AdminController) RegisterRoutes(api *gin.RouterGroup) {
    admin := api.Group("/admin")
    admin.Use(middlewares.AuthMiddleware(ac.config))
    admin.Use(middlewares.AdminMiddleware())
    {
        admin.GET("/profile", ac.GetProfile)
        admin.PUT("/profile", ac.UpdateProfile)
    }
} 