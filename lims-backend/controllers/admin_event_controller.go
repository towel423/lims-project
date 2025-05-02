package controllers

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Inisialisasi validator
var validateEvent = validator.New()

var customErrorMessagesEvent = map[string]string{
	"Title.required":       "Title is required",
	"Title.min":            "Title must be at least 3 characters long",
	"Slug.required":        "Slug is required",
	"Description.required": "Description is required",
	"Description.min":      "Description must be at least 10 characters long",
	"CategoryID.required":  "Category is required",
	"CategoryID.numeric":   "Category must be a number",
	"Like.gte":             "Like count cannot be negative",
	"View.gte":             "View count cannot be negative",
	"Status.required":      "Status is required",
	"Status.oneof":         "Status must be either 1 or 2",
}

type AdminEventController struct {
	EventService *services.EventService
}

// NewAdminEventController initializes the controller and handles any errors from NewEventService
func NewAdminEventController() *AdminEventController {
	minioClient := config.MinioClient       // Ensure this is the correct Minio client initialization
	bucketName := os.Getenv("MINIO_BUCKET") // Ensure the environment variable is set
	minioService := services.NewMinioService(minioClient)

	// Initialize BannerService with the required arguments
	eventService := services.NewEventService(minioClient, bucketName, minioService)
	return &AdminEventController{EventService: eventService}
}

// GetEvent handles fetching a event by slug
func (c *AdminEventController) GetEvent(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	event, err := c.EventService.GetEventBySlug(slug)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusNotFound,
			"message":    "Event not found",
			"data":       nil,
		})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "Event fetched successfully",
		"data":       event,
	})
}

// GetEventUUID handles fetching a event by UUID
func (c *AdminEventController) GetEventUUID(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "event", "read", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	// Ambil parameter UUID
	uuidParam := ctx.Params("uuid")

	// Validasi apakah UUID memiliki format yang benar
	if _, err := uuid.Parse(uuidParam); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid UUID format",
			"data":       nil,
		})
	}

	// Memanggil service untuk mendapatkan data publikasi
	event, err := c.EventService.GetEventByUUID(uuidParam)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Event not found",
			"data":       nil,
		})
	}

	// Jika berhasil, kembalikan respon dengan data
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Event fetched successfully",
		"data":       event,
	})
}

// Other methods follow the same pattern of using ctx for handling status and locals
// GetEventsPaginated handles fetching paginated events with sorting
func (c *AdminEventController) GetEventsPaginated(ctx *fiber.Ctx) error {
	// // Get the username from the context (set by the JWT middleware)
	// username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// // Get the Casbin enforcer
	// enforcer := helpers.GetCasbinEnforcer()

	// // Check if the user has access to the "/admin" resource using the "GET" action
	// hasAccess, err := enforcer.Enforce(username, "event", "read", "none", "none", "none")
	// if err != nil {
	// 	return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
	// 		"statusCode": fiber.StatusInternalServerError,
	// 		"message":    "Failed to check access.",
	// 	})
	// }

	// if !hasAccess {
	// 	return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
	// 		"statusCode": fiber.StatusForbidden,
	// 		"message":    "Forbidden: You don't have access to this resource",
	// 	})
	// }

	perPageStr := ctx.Query("perPage", ctx.Query("pageSize", "10"))
	pageStr := ctx.Query("currentPage", ctx.Query("page", "1"))
	sortBy := ctx.Query("sortBy", "id")
	sortDescStr := ctx.Query("sortDesc", "false")
	startDate := ctx.Query("start_date", "")
	endDate := ctx.Query("end_date", "")

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid perPage value",
			"data":       nil,
		})
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid page value",
			"data":       nil,
		})
	}

	sortDesc, err := strconv.ParseBool(sortDescStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid sortDesc value",
			"data":       nil,
		})
	}

	events, err := c.EventService.GetEventsPaginated(perPage, page, sortBy, sortDesc, startDate, endDate)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminEvents fetched successfully",
		"data":       events,
	})
}

func (c *AdminEventController) CreateEvent(ctx *fiber.Ctx) error {
	event := new(models.Event)

	// Ambil data dari multipart form
	event.Title = strings.TrimSpace(ctx.FormValue("title"))
	event.Category = strings.TrimSpace(ctx.FormValue("category"))
	event.Content = strings.TrimSpace(ctx.FormValue("content"))
	event.Description = strings.TrimSpace(ctx.FormValue("description"))
	event.Location = strings.TrimSpace(ctx.FormValue("location"))
	event.Slug = strings.TrimSpace(ctx.FormValue("slug"))
	event.StartTime = strings.TrimSpace(ctx.FormValue("start_time"))
	event.Status = strings.TrimSpace(ctx.FormValue("status"))

	// Validasi input
	if event.Title == "" || ctx.FormValue("start_date") == "" || ctx.FormValue("end_date") == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "All fields (title, start_date, end_date, start_time) are required",
		})
	}

	// Parsing start_date
	startDateStr := strings.TrimSpace(ctx.FormValue("start_date"))
	parsedStartDate, err := time.Parse("2006-01-02T15:04:05", startDateStr)
	if err != nil {
		log.Printf("Invalid start_date format: %v", err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid start_date format, use YYYY-MM-DDTHH:MM:SS (e.g., 2024-12-17T14:55:00)",
		})
	}
	event.StartDate = parsedStartDate

	// Parsing end_date
	endDateStr := strings.TrimSpace(ctx.FormValue("end_date"))
	parsedEndDate, err := time.Parse("2006-01-02T15:04:05", endDateStr)
	if err != nil {
		log.Printf("Invalid end_date format: %v", err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid end_date format, use YYYY-MM-DDTHH:MM:SS (e.g., 2024-12-17T14:55:00)",
		})
	}
	event.EndDate = parsedEndDate

	// Ambil file image jika ada
	img, err := ctx.FormFile("image_url")
	if err != nil && err != fiber.ErrUnprocessableEntity {
		img = nil
	}

	// Panggil service untuk membuat event
	err = c.EventService.CreateEvent(event, img)
	if err != nil {
		// Jika error adalah fiber.Error, gunakan status dan pesan yang relevan
		if fe, ok := err.(*fiber.Error); ok {
			return ctx.Status(fe.Code).JSON(fiber.Map{
				"statusCode": fe.Code,
				"status":     "error",
				"message":    fe.Message,
			})
		}

		// Jika error lain, kembalikan error internal
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    "Failed to create event",
		})
	}

	// Response success
	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"status":     "success",
		"message":    "Event created successfully",
		"data":       event,
	})
}

func (c *AdminEventController) UpdateEvent(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string)

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to update
	hasAccess, err := enforcer.Enforce(username, "event", "update", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}

	uuid := ctx.Params("uuid")
	updatedAdminEvent := new(models.Event)

	// Parse request body into the AdminEvent model
	if err := ctx.BodyParser(updatedAdminEvent); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validate the input data
	if err := validateEvent.Struct(updatedAdminEvent); err != nil {
		// If validation fails, return the validation error messages
		validationErrors := err.(validator.ValidationErrors)
		errors := make(map[string]string)

		for _, err := range validationErrors {
			field := err.Field() // Field that failed validation
			tag := err.Tag()     // The validation rule (e.g., 'required', 'min', 'numeric')

			// Construct error key using field and tag, e.g., "Title.required"
			errorKey := fmt.Sprintf("%s.%s", field, tag)

			// Get custom error message from customErrorMessagesEvent or use a default message
			if customMsg, exists := customErrorMessagesEvent[errorKey]; exists {
				errors[field] = customMsg
			} else {
				// Provide a default message if no custom message is found
				switch tag {
				case "required":
					errors[field] = fmt.Sprintf("%s is required", field)
				case "min":
					errors[field] = fmt.Sprintf("%s must be at least %s characters", field, err.Param())
				case "numeric":
					errors[field] = fmt.Sprintf("%s must be a number", field)
				case "gte":
					errors[field] = fmt.Sprintf("%s must be greater than or equal to %s", field, err.Param())
				case "oneof":
					errors[field] = fmt.Sprintf("%s must be one of the following: %s", field, err.Param())
				default:
					errors[field] = fmt.Sprintf("%s is invalid", field)
				}
			}
		}

		// Return the validation errors with a 400 status code
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Validation failed",
			"errors":     errors,
		})
	}

	// Handle file upload (if present)
	img, err := ctx.FormFile("image_url")
	// if err != nil {
	// 	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"error": "Failed to get file",
	// 	})
	// }

	// Check if the uploaded file is valid
	// if img == nil || img.Size == 0 {
	// 	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"error": "Invalid file. Please upload a valid file.",
	// 	})
	// }

	// Format ISO 8601 untuk tanggal

	layout := "2006-01-02T15:04:05"

	startDateStr := strings.TrimSpace(ctx.FormValue("start_date"))
	startDate, err := time.Parse(layout, startDateStr)
	if err != nil {
		log.Printf("Error parsing start_date: %v", err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid start_date format. Expected format: 2006-01-02T15:04:05Z",
		})
	}

	// Format ke YYYY-MM-DD
	formattedStartDate := startDate.Format("2006-01-02")
	log.Printf("Formatted start_date: %s", formattedStartDate)

	endDateStr := strings.TrimSpace(ctx.FormValue("end_date"))

	var endDate *time.Time
	if endDateStr != "" {
		parsedDate, err := time.Parse(layout, endDateStr)
		if err != nil {
			log.Printf("Error parsing end_date: %v", err)
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"statusCode": fiber.StatusBadRequest,
				"status":     "error",
				"message":    "Invalid end_date format. Expected format: 2006-01-02T15:04:05Z",
			})
		}
		endDate = &parsedDate
	}

	// Jika diperlukan format DATE
	if endDate != nil {
		formattedEndDate := endDate.Format("2006-01-02")
		log.Printf("Formatted end_date: %s", formattedEndDate)
	}

	layoutTime := "15:04"
	startTimeStr := strings.TrimSpace(ctx.FormValue("start_time"))

	startTime, err := time.Parse(layoutTime, startTimeStr)
	if err != nil {
		log.Printf("Error parsing start_time: %v", err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid start_time format. Expected format: 15:04",
		})
	}

	log.Printf("Parsed start_time: %v", startTime)

	// Parse status
	status := ctx.FormValue("status")
	if status != "" {
		parsedStatus, err := strconv.Atoi(status)
		if err != nil {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"statusCode": fiber.StatusBadRequest,
				"status":     "error",
				"message":    "Invalid status value",
			})
		}
		updatedAdminEvent.Status = strconv.Itoa(parsedStatus) // Convert integer to string
	}

	// Update nilai ke dalam updatedEvent
	updatedAdminEvent.StartDate = startDate // Pastikan StartDate menggunakan pointer
	if endDate != nil {
		updatedAdminEvent.EndDate = *endDate // Pastikan EndDate menggunakan pointer
	}
	updatedAdminEvent.StartTime = startTimeStr

	updatedEvent, err := c.EventService.UpdateEvent(uuid, updatedAdminEvent, img)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    err.Error(),
		})
	}

	// Return a success response when the event is updated
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"status":     "success",
		"message":    "Event updated successfully",
		"data":       updatedEvent,
	})
}

// DeleteAdminEvent handles deleting a event by slug
func (c *AdminEventController) DeleteEvent(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "event", "delete", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}

	uuid := ctx.Params("uuid")

	if err := c.EventService.DeleteEvent(uuid); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to delete event",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "Event deleted successfully",
		"data":       nil,
	})
}
