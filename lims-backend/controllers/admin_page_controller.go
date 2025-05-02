package controllers

import (
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"fmt"
	"log"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Inisialisasi validator
var validateAdminPage = validator.New()

var customErrorMessagesAdminPage = map[string]string{
	"Title.required":   "Title is required",
	"Title.min":        "Title must be at least 3 characters long",
	"Slug.required":    "Slug is required",
	"Details.required": "Details is required",
	"Details.min":      "Details must be at least 10 characters long",
}

type AdminPageController struct {
	AdminPageService *services.AdminPageService
}

// NewAdminPageController initializes the controller and handles any errors from NewAdminPageService
func NewAdminPageController() *AdminPageController {
	adminPageService, err := services.NewAdminPageService()
	if err != nil {
		log.Fatalf("Failed to initialize adminPage service: %v", err) // Log and stop execution if there's an error
	}
	return &AdminPageController{AdminPageService: adminPageService}
}

// GetAdminPage handles fetching a adminPage by slug
func (c *AdminPageController) GetAdminPage(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	adminPage, err := c.AdminPageService.GetAdminPageBySlug(slug)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusNotFound,
			"message":    "AdminPage not found",
			"data":       nil,
		})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminPage fetched successfully",
		"data":       adminPage,
	})
}

// GetAdminPageUUID handles fetching a adminPage by UUID
func (c *AdminPageController) GetAdminPageUUID(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "pages", "read", "none", "none", "none")
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
	adminPage, err := c.AdminPageService.GetAdminPageByUUID(uuidParam)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "AdminPage not found",
			"data":       nil,
		})
	}

	// Jika berhasil, kembalikan respon dengan data
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "AdminPage fetched successfully",
		"data":       adminPage,
	})
}

// Other methods follow the same pattern of using ctx for handling status and locals

// GetAdminPageByCategory handles fetching adminPages by category slug
func (c *AdminPageController) GetAdminPageByCategory(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	adminPages, err := c.AdminPageService.GetAdminPagesByCategory(slug)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusNotFound,
			"message":    "No adminPages found in this category",
			"data":       nil,
		})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminPages fetched successfully",
		"data":       adminPages,
	})
}

// GetAdminPagesPaginated handles fetching paginated adminPages with sorting
func (c *AdminPageController) GetAdminPagesCategory(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "pages", "read", "none", "none", "none")
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

	perPageStr := ctx.Query("perPage", ctx.Query("pageSize", "10"))
	pageStr := ctx.Query("currentPage", ctx.Query("pages", "1"))
	sortBy := ctx.Query("sortBy", "id")
	sortDescStr := ctx.Query("sortDesc", "false")

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

	adminPages, err := c.AdminPageService.GetAdminPagesCategoryPaginated(perPage, page, sortBy, sortDesc)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "Category AdminPages fetched successfully",
		"data":       adminPages,
	})
}

// GetAdminPagesPaginated handles fetching paginated adminPages with sorting
func (c *AdminPageController) GetAdminPagesPaginated(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "pages", "read", "none", "none", "none")
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

	perPageStr := ctx.Query("pageSize", ctx.Query("pageSize", "10"))
	pageStr := ctx.Query("currentPage", "1")
	sortBy := ctx.Query("sortBy", "id")
	sortDescStr := ctx.Query("sortDesc", "false")

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid perPage values",
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

	adminPages, err := c.AdminPageService.GetAdminPagesPaginated(perPage, page, sortBy, sortDesc)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminPages fetched successfully",
		"data":       adminPages,
	})
}

func (c *AdminPageController) CreateAdminPage(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "pages", "create", "none", "none", "none")
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
	// Parse request body into the AdminPage model
	adminPage := new(models.Page)
	if err := ctx.BodyParser(adminPage); err != nil {
		// Handle empty or invalid input format
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validate the input data
	if err := validateAdminPage.Struct(adminPage); err != nil {
		// If validation fails, return the validation error messages
		validationErrors := err.(validator.ValidationErrors)
		errors := make(map[string]string)

		for _, err := range validationErrors {
			field := err.Field() // Field that failed validation
			tag := err.Tag()     // The validation rule (e.g., 'required', 'min', 'numeric')

			// Construct error key using field and tag, e.g., "Title.required"
			errorKey := fmt.Sprintf("%s.%s", field, tag)

			// Get custom error message from customErrorMessagesAdminPage or use a default message
			if customMsg, exists := customErrorMessagesAdminPage[errorKey]; exists {
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
	image, err := ctx.FormFile("image")
	if err != nil && err != fiber.ErrUnprocessableEntity {
		image = nil
	}

	// Create the adminPage with the uploaded image
	if err := c.AdminPageService.CreateAdminPage(adminPage, image); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    err.Error(),
		})
	}

	// Return a success response when the adminPage is created
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"status":     "success",
		"message":    "AdminPage created successfully",
		"data":       adminPage,
	})
}

func (c *AdminPageController) UpdateAdminPage(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string)

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to update
	hasAccess, err := enforcer.Enforce(username, "pages", "update", "none", "none", "none")
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
	updatedAdminPage := new(models.Page)

	// Parse request body into the AdminPage model
	if err := ctx.BodyParser(updatedAdminPage); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}
	fmt.Printf("updatedAdminPage", updatedAdminPage)

	// Validate the input data
	if err := validateAdminPage.Struct(updatedAdminPage); err != nil {
		// If validation fails, return the validation error messages
		validationErrors := err.(validator.ValidationErrors)
		errors := make(map[string]string)

		for _, err := range validationErrors {
			field := err.Field() // Field that failed validation
			tag := err.Tag()     // The validation rule (e.g., 'required', 'min', 'numeric')
			// Debugging output
			fmt.Printf("Validation failed for field: %s with rule: %s\n", field, tag)

			// Construct error key using field and tag, e.g., "Title.required"
			errorKey := fmt.Sprintf("%s.%s", field, tag)

			// Get custom error message from customErrorMessagesAdminPage or use a default message
			if customMsg, exists := customErrorMessagesAdminPage[errorKey]; exists {
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
	image, err := ctx.FormFile("image")
	if err != nil && err != fiber.ErrUnprocessableEntity {
		image = nil
	}

	// Call the service layer to update the adminPage with the provided data and image
	if err := c.AdminPageService.UpdateAdminPage(uuid, updatedAdminPage, image); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    err.Error(),
		})
	}

	// Return a success response when the adminPage is updated
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"status":     "success",
		"message":    "AdminPage updated successfully",
		"data":       updatedAdminPage,
	})
}

// DeleteAdminPage handles deleting a adminPage by slug
func (c *AdminPageController) DeleteAdminPage(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "pages", "delete", "none", "none", "none")
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

	if err := c.AdminPageService.DeleteAdminPage(uuid); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to delete adminPage",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminPage deleted successfully",
		"data":       nil,
	})
}
