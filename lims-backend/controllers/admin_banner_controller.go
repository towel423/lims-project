package controllers

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"fmt"
	"os"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Inisialisasi validator
var validateBanner = validator.New()

var customErrorMessagesBanner = map[string]string{
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

type AdminBannerController struct {
	BannerService *services.PublicBannerService
}

func NewAdminBannerController() *AdminBannerController {
	// Ensure MinioClient and bucketName are properly initialized
	minioClient := config.MinioClient       // Ensure this is the correct Minio client initialization
	bucketName := os.Getenv("MINIO_BUCKET") // Ensure the environment variable is set
	minioService := services.NewMinioService(minioClient)

	// Initialize BannerService with the required arguments
	bannerService := services.NewBannerService(minioClient, bucketName, minioService)

	return &AdminBannerController{BannerService: bannerService}
}

// GetBanner handles fetching a banner by slug
func (c *AdminBannerController) GetBanner(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	banner, err := c.BannerService.GetBannerBySlug(slug)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusNotFound,
			"message":    "Banner not found",
			"data":       nil,
		})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "Banner fetched successfully",
		"data":       banner,
	})
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

// GetBannerUUID handles fetching a banner by UUID
func (c *AdminBannerController) GetBannerUUID(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "banner", "read", "none", "none", "none")
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
	banner, err := c.BannerService.GetBannerByUUID(uuidParam)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Banner not found",
			"data":       nil,
		})
	}

	// Modifikasi active agar berupa integer
	responseData := fiber.Map{
		"id":         banner.ID,
		"title":      banner.Title,
		"subtitle":   banner.Subtitle,
		"link":       banner.Link,
		"image_url":  banner.ImageURL,
		"uuid":       banner.UUID,
		"active":     boolToInt(banner.Active), // 🔹 Konversi boolean -> int
		"created_at": banner.CreatedAt,
		"updated_at": banner.UpdatedAt,
		"created_by": banner.CreatedBy,
		"updated_by": banner.UpdatedBy,
		"DeletedAt":  banner.DeletedAt,
	}

	// Jika berhasil, kembalikan respon dengan data
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Banner fetched successfully",
		"data":       responseData,
	})
}

// Other methods follow the same pattern of using ctx for handling status and locals
// GetBannersPaginated handles fetching paginated banners with sorting
func (c *AdminBannerController) GetBannersPaginated(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	// username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// // Get the Casbin enforcer
	// enforcer := helpers.GetCasbinEnforcer()

	// // Check if the user has access to the "/admin" resource using the "GET" action
	// hasAccess, err := enforcer.Enforce(username, "banner", "read", "none", "none", "none")
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

	banners, err := c.BannerService.GetBannersPaginated(perPage, page, sortBy, sortDesc)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "AdminBanners fetched successfully",
		"data":       banners,
	})
}

func (c *AdminBannerController) CreateBanner(ctx *fiber.Ctx) error {
	// Parse request body into the AdminBanner model
	banner := new(models.Banner)
	if err := ctx.BodyParser(banner); err != nil {
		// Handle empty or invalid input format
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validate the input data
	if err := validateBanner.Struct(banner); err != nil {
		// If validation fails, return the validation error messages
		validationErrors := err.(validator.ValidationErrors)
		errors := make(map[string]string)

		for _, err := range validationErrors {
			field := err.Field() // Field that failed validation
			tag := err.Tag()     // The validation rule (e.g., 'required', 'min', 'numeric')

			// Construct error key using field and tag, e.g., "Title.required"
			errorKey := fmt.Sprintf("%s.%s", field, tag)

			// Get custom error message from customErrorMessagesBanner or use a default message
			if customMsg, exists := customErrorMessagesBanner[errorKey]; exists {
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
	if err != nil && err != fiber.ErrUnprocessableEntity {
		img = nil
	}

	// Create the banner with the uploaded image
	if err := c.BannerService.CreateBanner(banner, img); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    err.Error(),
		})
	}

	// Return a success response when the banner is created
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"status":     "success",
		"message":    "Banner created successfully",
		"data":       banner,
	})
}

func (c *AdminBannerController) UpdateBanner(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string)

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to update
	hasAccess, err := enforcer.Enforce(username, "banner", "update", "none", "none", "none")
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
	updatedAdminBanner := new(models.Banner)

	// Parse request body into the AdminBanner model
	if err := ctx.BodyParser(updatedAdminBanner); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"status":     "error",
			"message":    "Invalid or empty input",
		})
	}

	// Validate the input data
	if err := validateBanner.Struct(updatedAdminBanner); err != nil {
		// If validation fails, return the validation error messages
		validationErrors := err.(validator.ValidationErrors)
		errors := make(map[string]string)

		for _, err := range validationErrors {
			field := err.Field() // Field that failed validation
			tag := err.Tag()     // The validation rule (e.g., 'required', 'min', 'numeric')

			// Construct error key using field and tag, e.g., "Title.required"
			errorKey := fmt.Sprintf("%s.%s", field, tag)

			// Get custom error message from customErrorMessagesBanner or use a default message
			if customMsg, exists := customErrorMessagesBanner[errorKey]; exists {
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

	if err := c.BannerService.UpdateBanner(uuid, updatedAdminBanner, img); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    err.Error(),
		})
	}

	// Ambil ulang banner yang baru saja diperbarui dari database
	updatedBanner, err := c.BannerService.GetBannerByUUID(uuid)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"status":     "error",
			"message":    "Failed to retrieve updated banner data",
		})
	}

	// Kembalikan data yang sudah diperbarui ke dalam respons
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"status":     "success",
		"message":    "Banner updated successfully",
		"data":       updatedBanner,
	})
}

// DeleteAdminBanner handles deleting a banner by slug
func (c *AdminBannerController) DeleteBanner(ctx *fiber.Ctx) error {
	// Get the username from the context (set by the JWT middleware)
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "banner", "delete", "none", "none", "none")
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

	if err := c.BannerService.DeleteBanner(uuid); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to delete banner",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{ // Use ctx.Status
		"statusCode": fiber.StatusOK,
		"message":    "Banner deleted successfully",
		"data":       nil,
	})
}
