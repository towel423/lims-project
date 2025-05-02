package controllers

import (
	"backend-school/config"
	"backend-school/services"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type EventController struct {
	EventService *services.EventService
}

// NewEventController initializes the controller and handles any errors from NewEventService
func NewEventController() *EventController {
	minioClient := config.MinioClient       // Ensure this is the correct Minio client initialization
	bucketName := os.Getenv("MINIO_BUCKET") // Ensure the environment variable is set
	minioService := services.NewMinioService(minioClient)

	// Initialize BannerService with the required arguments
	eventService := services.NewEventService(minioClient, bucketName, minioService)
	return &EventController{EventService: eventService}
}

func (c *EventController) GetEvents(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("currentPage", "1")
	pageSizeStr := ctx.Query("pageSize", "10")
	search := ctx.Query("search", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil || currentPage < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid currentPage"})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pageSize"})
	}

	result, err := c.EventService.GetEvents(currentPage, pageSize, search)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch events"})
	}

	return ctx.JSON(result)
}

func (c *EventController) Search(ctx *fiber.Ctx) error {
	search := ctx.Query("slug", "")
	event, err := c.EventService.SearchBySlug(search)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Event not found"})
	}

	return ctx.JSON(event)
}
