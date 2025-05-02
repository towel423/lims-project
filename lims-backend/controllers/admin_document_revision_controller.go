package controllers

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"errors"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminDocumentRevisionController struct {
	Service *services.AdminDocumentRevisionService
}

// NewDocumentControlController initializes and returns a new DocumentControlController
func NewDocumentRevisionController() *AdminDocumentRevisionController {
	minioClient := config.MinioClient // Assumes MinioClient is initialized
	bucketName := os.Getenv("MINIO_BUCKET")
	minioService := services.NewMinioService(minioClient)

	documentRevisionService := services.NewAdminDocumentRevisionService(minioClient, bucketName, minioService)

	return &AdminDocumentRevisionController{Service: documentRevisionService}
}

// GetDocumentRevisionsPaginated retrieves a paginated list of document revisions
func (c *AdminDocumentRevisionController) GetDocumentRevisionsPaginatedPublished(ctx *fiber.Ctx) error {
	// Parse pagination parameters
	pageStr := ctx.Query("page", "1")
	perPageStr := ctx.Query("perPage", "10")
	sortBy := ctx.Query("sortBy", "id")
	sortDescStr := ctx.Query("sortDesc", "false")
	showAllStr := ctx.Query("showAll", "false")
	documentRevisionUUID := ctx.Query("document_control_uuid", "")

	// Convert string query parameters to appropriate types
	currentPage, err := strconv.Atoi(pageStr)
	if err != nil || currentPage <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid page parameter",
		})
	}

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid perPage parameter",
		})
	}

	sortDesc := sortDescStr == "true"
	showAll := showAllStr == "true"

	// Validate required parameters
	if documentRevisionUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "document_control_uuid is required",
		})
	}

	// Call the service to get paginated document revisions
	result, err := c.Service.GetDocumentRevisionsPaginatedPublished(
		currentPage, perPage, sortBy, sortDesc, showAll, documentRevisionUUID,
	)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document revisions",
			"error":      err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

// GetDocumentRevisionsPaginated retrieves a paginated list of document revisions
func (c *AdminDocumentRevisionController) GetDocumentRevisionsPaginatedApproval(ctx *fiber.Ctx) error {
	// Parse pagination parameters
	pageStr := ctx.Query("page", "1")
	perPageStr := ctx.Query("perPage", "10")
	sortBy := ctx.Query("sortBy", "id")
	sortDescStr := ctx.Query("sortDesc", "false")
	showAllStr := ctx.Query("showAll", "false")
	documentRevisionUUID := ctx.Query("document_control_uuid", "")
	username := ctx.Locals("username").(string)

	// Convert string query parameters to appropriate types
	currentPage, err := strconv.Atoi(pageStr)
	if err != nil || currentPage <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid page parameter",
		})
	}

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid perPage parameter",
		})
	}

	sortDesc := sortDescStr == "true"
	showAll := showAllStr == "true"

	// Validate required parameters
	if documentRevisionUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "document_control_uuid is required",
		})
	}

	var documentControl models.DocumentControl
	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

	// Find the document category by UUID
	if err := config.DB.Where("uuid = ?", documentRevisionUUID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "control document " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "control Document Not Found",
		})
	}

	// Find the document category by UUID
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "category document " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "Category Document Not Found",
		})
	}

	// Find the document type by id
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&typeDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Type Document Not Found",
		})
	}

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the requester has access to create the document
	hasAccess, err := enforcer.Enforce(username, "document", "draft", categoryDocument.Prefix, typeDocument.Prefix, "none")
	if err != nil {
		log.Printf("Error checking Casbin permissions: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access permissions.",
		})
	}

	// If the requester doesn't have access, return a forbidden status
	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have permission to access this resource.",
		})
	}

	// Call the service to get paginated document revisions
	result, err := c.Service.GetDocumentRevisionsPaginatedApproval(
		currentPage, perPage, sortBy, sortDesc, showAll, documentRevisionUUID, username,
	)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document revisions",
			"error":      err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

func (c *AdminDocumentRevisionController) ApproveDocumentRevision(ctx *fiber.Ctx) error {
	documentRevisionUUID := ctx.Params("uuid")
	userID := ctx.Locals("user_id").(int) // Pastikan middleware menyimpan user_id di context
	username := ctx.Locals("username").(string)

	// Step 2: Retrieve the document revision by UUID
	var documentRevision models.DocumentVersion
	if err := config.DB.Where("uuid = ?", documentRevisionUUID).First(&documentRevision).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document revision not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document revision",
			"error":      err.Error(),
		})
	}

	// Step 3: Join to get the status document details
	var statusDocument models.StatusDocument
	if err := config.DB.Where("id = ?", documentRevision.StatusDocumentID).First(&statusDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Status document not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve status document",
			"error":      err.Error(),
		})
	}

	var documentControl models.DocumentControl
	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

	// Find the document category by UUID
	if err := config.DB.Where("id = ?", documentRevision.DocumentControlID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "control document " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "control Document Not Found",
		})
	}

	// Find the document category by UUID
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "category document " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "Category Document Not Found",
		})
	}

	// Find the document type by id
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&typeDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Type Document Not Found",
		})
	}

	enforcer := helpers.GetCasbinEnforcer()

	// Step 4: Check user role and status document permissions
	var newStatusID int
	var logNote string
	switch statusDocument.Name {
	case "Draft":
		// Check if the requester has access to create the document
		hasAccess, err := enforcer.Enforce(username, "document", "approved", categoryDocument.Prefix, typeDocument.Prefix, "none")
		if err != nil {
			log.Printf("Error checking Casbin permissions: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to check access permissions.",
			})
		}

		// If the requester doesn't have access, return a forbidden status
		if !hasAccess {
			return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"statusCode": fiber.StatusForbidden,
				"message":    "Forbidden: You don't have permission to access this resource.",
			})
		}
		newStatusID = 2 // Assuming 2 is the ID for 'Approved'
		logNote = "Status updated from Draft to Approved"

	case "Approved":
		// Check if the requester has access to create the document
		hasAccess, err := enforcer.Enforce(username, "document", "published", categoryDocument.Prefix, typeDocument.Prefix, "none")
		if err != nil {
			log.Printf("Error checking Casbin permissions: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to check access permissions.",
			})
		}

		// If the requester doesn't have access, return a forbidden status
		if !hasAccess {
			return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"statusCode": fiber.StatusForbidden,
				"message":    "Forbidden: You don't have permission to access this resource.",
			})
		}

		newStatusID = 3 // Assuming 3 is the ID for 'Published'
		logNote = "Status updated from Approved to Published"

	default:
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Invalid document status for approval",
		})
	}

	// Update the document revision status
	documentRevision.StatusDocumentID = &newStatusID
	if err := config.DB.Save(&documentRevision).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update document revision status",
			"error":      err.Error(),
		})
	}

	// Update the document control status
	documentControl.StatusDocumentID = &newStatusID
	documentControl.Description = documentRevision.Description
	documentControl.PageCount = *documentRevision.PageCount

	if err := config.DB.Save(&documentControl).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update document control status",
			"error":      err.Error(),
		})
	}

	// Step 5: Create a new document log
	documentLog := models.DocumentLog{
		UUID:              uuid.New(), // Generate UUID baru
		DocumentVersionID: &documentRevision.ID,
		StatusDocumentID:  &newStatusID,
		CreatedBy:         &userID,
		CreatedAt:         time.Now(),
		Note:              &logNote,
	}
	if err := config.DB.Create(&documentLog).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to create document log",
			"error":      err.Error(),
		})
	}

	// Step 6: Return success response
	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document revision approved successfully",
		"data":       documentRevision,
	})
}

// CreateDocumentRevision handles the creation of a new document revision
// CreateDocumentRevision handles the creation of a new document revision
func (c *AdminDocumentRevisionController) CreateDocumentRevision(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)
	// Extract document_control_uuid from route parameter
	documentControlUUID := ctx.Params("document_control_uuid")
	if documentControlUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Document Control UUID is required",
		})
	}

	// Parse form data
	documentNumber := ctx.FormValue("document_number")
	if documentNumber == "" {
		// return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		// 	"statusCode": fiber.StatusBadRequest,
		// 	"message":    "Document number is required",
		// })
	}

	description := ctx.FormValue("description")
	if description == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Description is required",
		})
	}

	pageCountStr := ctx.FormValue("page_count")
	if pageCountStr == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Page count is required",
		})
	}

	pageCount, err := strconv.Atoi(pageCountStr)
	if err != nil || pageCount <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid page count",
		})
	}

	// Validate uploaded file
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "File upload failed",
			"detail":     err.Error(),
		})
	}

	var documentControl models.DocumentControl
	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

	// Find the document category by UUID
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "document control " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "Category Document Not Found",
		})
	}

	// Find the document category by UUID
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "category document " + err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.ErrNotFound,
			"message":    "Category Document Not Found",
		})
	}

	// Find the document type by id
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&typeDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Type Document Not Found",
		})
	}

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the requester has access to create the document
	hasAccess, err := enforcer.Enforce(username, "document", "draft", categoryDocument.Prefix, typeDocument.Prefix, "none")
	if err != nil {
		log.Printf("Error checking Casbin permissions: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access permissions.",
		})
	}

	// If the requester doesn't have access, return a forbidden status
	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have permission to access this resource.",
		})
	}

	// Call the service to handle the logic
	err = c.Service.CreateDocumentRevision(
		documentControlUUID,
		userID,
		fileHeader,
		description,
		pageCount,
		documentNumber,
	)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to create document revision",
			"detail":     err.Error(),
		})
	}

	enforcer = helpers.GetCasbinEnforcer()
	err = enforcer.LoadPolicy()
	if err != nil {
		log.Fatalf("Failed to load Casbin policies: %v", err)
	}

	// Return success response
	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"message":    "Document revision created successfully",
	})
}

// Helper function to convert string to int with default fallback
func atoiOrDefault(value string, defaultValue int) int {
	if intValue, err := strconv.Atoi(value); err == nil {
		return intValue
	}
	return defaultValue
}
