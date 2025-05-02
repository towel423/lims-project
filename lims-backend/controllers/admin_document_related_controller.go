package controllers

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/services"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type DocumentRelatedController struct {
	Service *services.DocumentRelatedService
}

func NewDocumentRelatedController() *DocumentRelatedController {
	minioClient := config.MinioClient // Assumes MinioClient is initialized
	bucketName := os.Getenv("MINIO_BUCKET")
	minioService := services.NewMinioService(minioClient)

	documentRelatedService := services.NewDocumentRelatedService(minioClient, bucketName, minioService)

	return &DocumentRelatedController{Service: documentRelatedService}
}

// CreateDocumentRelated handles creating a new document_related entry
func (c *DocumentRelatedController) LinkDocumentRelated(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "roles" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "document", "draft", "none", "none", "none")
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

	// Get the user_id from the context, ensuring the type is correct
	var userID int
	rawUserID := ctx.Locals("user_id")
	if id, ok := rawUserID.(int); ok {
		userID = id
	} else {
		log.Println("Error: user_id is not an integer")
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Internal Server Error: Invalid user_id type",
		})
	}

	var req services.DocumentRelatedPayload
	err = ctx.BodyParser(&req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to parse request body",
			"error":      err.Error(),
		})
	}

	// Add user_id
	req.CreatedBy = userID

	// Extract document_control_uuid from the route params
	documentControlUUID := ctx.Params("document_control_uuid")
	if documentControlUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Document control UUID is required.",
		})
	}

	// Delegate to the service layer
	result, err := c.Service.CreateLinkDocumentRelated(ctx, documentControlUUID, &req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
		})
	}

	// Return success response
	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"message":    "Document related linked successfully.",
		"data":       result,
	})
}

// CreateDocumentRelated handles creating a new document_related entry
func (c *DocumentRelatedController) UnlinkDocumentRelated(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "roles" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "document", "draft", "none", "none", "none")
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

	// Get the user_id from the context, ensuring the type is correct
	var userID int
	rawUserID := ctx.Locals("user_id")
	if id, ok := rawUserID.(int); ok {
		userID = id
	} else {
		log.Println("Error: user_id is not an integer")
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Internal Server Error: Invalid user_id type",
		})
	}

	var req services.DocumentRelatedPayload
	err = ctx.BodyParser(&req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to parse request body",
			"error":      err.Error(),
		})
	}

	// Add user_id
	req.CreatedBy = userID

	// Extract document_control_uuid from the route params
	documentControlUUID := ctx.Params("document_control_uuid")
	if documentControlUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Document control UUID is required.",
		})
	}

	// Delegate to the service layer
	err = c.Service.RemoveLinkDocumentRelated(ctx, documentControlUUID, &req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
		})
	}

	// Return success response
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document related unlinked successfully.",
		"data":       "",
	})
}

// GetPaginatedRelatedDocuments handles retrieving related documents with pagination and filtering by document_control_uuid
func (c *DocumentRelatedController) GetPaginatedRelatedDocuments(ctx *fiber.Ctx) error {
	// Extract pagination query parameters
	currentPage := ctx.Query("currentPage", "1")
	pageSize := ctx.Query("pageSize", "10")
	documentControlUUID := ctx.Query("document_control_uuid", "")

	// Delegate to the service layer
	result, err := c.Service.GetPaginatedRelatedDocuments(ctx, currentPage, pageSize, documentControlUUID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
		})
	}

	// Return success response
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Paginated related documents fetched successfully.",
		"data":       result,
	})
}

// GetPresignedURL generates a presigned URL for previewing a file from its public MinIO URL
func (c *DocumentRelatedController) GetPresignedURLDocRelated(ctx *fiber.Ctx) error {
	// Define a struct to parse the request body
	type RequestBody struct {
		URL string `json:"url"`
	}

	// Parse the request body
	var body RequestBody
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid request body",
			"error":      err.Error(),
		})
	}

	// Validate the URL
	if body.URL == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Public URL is required",
		})
	}

	// Set expiration for the presigned URL (e.g., 60 seconds)
	expiration := int64(10)

	// Generate presigned URL
	presignedURL, err := c.Service.GeneratePresignedURLFromPublicURLDocRelated(body.URL, expiration)
	if err != nil {
		log.Printf("Error generating presigned URL: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to generate presigned URL",
			"error":      err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Presigned URL generated successfully",
		"data":       presignedURL,
	})
}

// DeleteRelatedDocument handles the deletion of a related document (soft delete)
func (c *DocumentRelatedController) DeleteRelatedDocument(ctx *fiber.Ctx) error {
	// Extract document_related UUID from route parameters
	documentRelatedUUID := ctx.Params("uuid")
	if documentRelatedUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Document related UUID is required.",
		})
	}

	// Delegate deletion to the service
	err := c.Service.DeleteRelatedDocument(documentRelatedUUID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
		})
	}

	// Return success response
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document related deleted successfully.",
	})
}
