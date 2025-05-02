package main

import (
	"fmt"
	"log"
	"object-storage/config"
	"object-storage/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

// @title MUI Bakcend
// @version 1.0
// @description This is a backend server.
// @host localhost:3000
// @BasePath /api
func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	} else {
		fmt.Println("Env loaded")
	}

	// Inisialisasi koneksi database
	if err := config.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	app := fiber.New()

	// Set up routes
	routes.SetupRoutes(app)

	// Start server
	if err := app.Listen(":3100"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
