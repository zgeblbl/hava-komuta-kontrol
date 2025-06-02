package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/sirupsen/logrus"
	"komutakontrol/config"
	"komutakontrol/database"
	"komutakontrol/routes"
)

func main() {
	// Initialize logger
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})
	logrus.Info("Starting Komuta Kontrol Ekranı Backend")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		logrus.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	if err := database.Initialize(cfg); err != nil {
		logrus.Fatalf("Failed to initialize database: %v", err)
	}

	// Setup router
	router := routes.SetupRouter(cfg)

	// Start the server in a goroutine
	go func() {
		addr := fmt.Sprintf(":%s", cfg.Server.Port)
		logrus.Infof("Server is running on http://localhost%s", addr)
		if err := router.Run(addr); err != nil {
			logrus.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Server is shutting down")
} 