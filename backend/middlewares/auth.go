package middlewares

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"komutakontrol/config"
	"komutakontrol/models"
	"komutakontrol/utils"
)

// AuthMiddleware verifies the JWT token and sets user info in the context
func AuthMiddleware(config *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := utils.VerifyToken(tokenString, config)
		if err != nil {
			logrus.Errorf("Token verification failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set claims in context
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RoleMiddleware checks if the user has the required role
func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		// Check if user role is in the allowed roles
		authorized := false
		for _, role := range roles {
			if userRole == role {
				authorized = true
				break
			}
		}

		if !authorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminMiddleware checks if the user is an admin
func AdminMiddleware() gin.HandlerFunc {
	return RoleMiddleware("admin")
}

// SupervisorMiddleware checks if the user is a supervisor
func SupervisorMiddleware() gin.HandlerFunc {
	return RoleMiddleware("admin", "supervisor")
}

// OperatorMiddleware checks if the user is an operator with HIGH or TOP authority
func OperatorMiddleware() gin.HandlerFunc {
	return RoleMiddleware("admin", "supervisor", "operator", string(models.AuthorityHigh), string(models.AuthorityTop))
}

// HighAuthorityMiddleware checks if the user has high authority
func HighAuthorityMiddleware() gin.HandlerFunc {
	return RoleMiddleware("admin", "supervisor", string(models.AuthorityHigh), string(models.AuthorityTop))
} 