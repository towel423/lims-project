package controllers

import (
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"fmt"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// Inisialisasi validator
// var validate = validator.New()

// Custom error messages for validation errors
// var customErrorMessages = map[string]string{
// 	"Name.required":    "Name is required",
// 	"Content.required": "Content is required",
// 	"Content.min":      "Content must be at least 10 characters long",
// }

type AdminTestimonialController struct {
	TestimonialService *services.AdminTestimonialService
}

// NewAdminTestimonialController initializes the controller and handles any errors from NewAdminTestimonialService
func NewAdminTestimonialController() *AdminTestimonialController {
	testimonialService := services.NewAdminTestimonialService()
	return &AdminTestimonialController{TestimonialService: testimonialService}
}

// GetTestimonialByID handles fetching a testimonial by ID
func (c *AdminTestimonialController) GetTestimonialByID(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "testimonial", "read", "none", "none", "none")
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
	idParam := ctx.Params("uuid")
	// id, err := uuid.Parse(idParam)
	// if err != nil {
	// 	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"statusCode": fiber.StatusBadRequest,
	// 		"message":    "Invalid UUID format",
	// 		"data":       nil,
	// 	})
	// }

	testimonial, err := c.TestimonialService.GetTestimonialByUUID(idParam)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Testimonial not found",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Testimonial fetched successfully",
		"data":       testimonial,
	})
}

// GetListPaginatedTestimonial handles fetching paginated testimonials with filtering by name
func (c *AdminTestimonialController) GetListPaginatedTestimonial(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "testimonial", "read", "none", "none", "none")
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

	// Fetch the paginated result from the service
	result, err := c.TestimonialService.GetListPaginated(currentPage, pageSize, search)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch testimonials",
			"data":       nil,
		})
	}

	// Format the response with statusCode, message, and data
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": fiber.Map{
			"statusCode":    fiber.StatusOK,
			"message":       "Testimonials fetched successfully",
			"data":          result["data"],
			"current_page":  result["current_page"],
			"per_page":      result["per_page"],
			"total_pages":   result["total_pages"],
			"total_records": result["total_records"],
		},
	})
}

// AddTestimonial handles the creation of a new testimonial
func (c *AdminTestimonialController) AddTestimonial(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "testimonial", "create", "none", "none", "none")
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
	// Parse form-data fields into testimonial struct
	testimonial := new(models.Testimonial)
	if err := ctx.BodyParser(testimonial); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validate testimonial struct
	if err := validate.Struct(testimonial); err != nil {
		return handleValidationError(ctx, err)
	}

	// Handle the photo upload (if provided)
	file, err := ctx.FormFile("image_url")
	if err != nil && err != fiber.ErrUnprocessableEntity {
		file = nil
	}

	// Call the service to add testimonial with photo
	if err := c.TestimonialService.AddTestimonial(testimonial, file); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to add testimonial",
		})
	}

	// Format the response as requested
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Testimonial created successfully",
		"data":       testimonial,
	})
}

// UpdateTestimonial handles updating an existing testimonial by UUID
func (c *AdminTestimonialController) UpdateTestimonial(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "testimonial", "update", "none", "none", "none")
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
	idParam := ctx.Params("uuid")

	updatedTestimonial := new(models.Testimonial)
	if err := ctx.BodyParser(updatedTestimonial); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validasi testimonial yang diterima
	if err := validate.Struct(updatedTestimonial); err != nil {
		return handleValidationError(ctx, err)
	}

	// Handle upload photo jika diberikan
	file, err := ctx.FormFile("photo")
	if err != nil && err != fiber.ErrUnprocessableEntity {
		file = nil
	}

	// Panggil service untuk update testimonial berdasarkan UUID
	updatedData, err := c.TestimonialService.UpdateTestimonialByUUID(idParam, updatedTestimonial, file)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update testimonial",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Testimonial updated successfully",
		"data":       updatedData,
	})
}

// DeleteTestimonial handles deleting a testimonial by ID
func (c *AdminTestimonialController) DeleteTestimonial(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "testimonial", "delete", "none", "none", "none")
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
	idParam := ctx.Params("uuid")
	// id, err := uuid.Parse(idParam)
	// if err != nil {
	// 	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"statusCode": fiber.StatusBadRequest,
	// 		"message":    "Invalid UUID format",
	// 		"data":       nil,
	// 	})
	// }

	if err := c.TestimonialService.DeleteTestimonial(idParam); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to delete testimonial",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Testimonial deleted successfully",
	})
}

// Helper function to handle validation errors and return detailed error messages
func handleValidationError(ctx *fiber.Ctx, err error) error {
	validationErrors := err.(validator.ValidationErrors)
	errors := make(map[string]string)

	for _, err := range validationErrors {
		field := err.Field()
		tag := err.Tag()
		errorKey := fmt.Sprintf("%s.%s", field, tag)

		// Use custom messages or defaults
		if customMsg, exists := customErrorMessages[errorKey]; exists {
			errors[field] = customMsg
		} else {
			switch tag {
			case "required":
				errors[field] = fmt.Sprintf("%s is required", field)
			case "min":
				errors[field] = fmt.Sprintf("%s must be at least %s characters", field, err.Param())
			case "numeric":
				errors[field] = fmt.Sprintf("%s must be a number", field)
			case "gte":
				errors[field] = fmt.Sprintf("%s must be greater than or equal to %s", field, err.Param())
			default:
				errors[field] = fmt.Sprintf("%s is invalid", field)
			}
		}
	}

	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"statusCode": fiber.StatusBadRequest,
		"status":     "error",
		"message":    "Validation failed",
		"errors":     errors,
	})
}
