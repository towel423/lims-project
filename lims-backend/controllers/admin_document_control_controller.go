package controllers

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"backend-school/utils"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go"
	"gorm.io/gorm"
)

type DocumentControlController struct {
	Service *services.DocumentControlService
}

// NewDocumentControlController initializes and returns a new DocumentControlController
func NewDocumentControlController() *DocumentControlController {
	minioClient := config.MinioClient // Assumes MinioClient is initialized
	bucketName := os.Getenv("MINIO_BUCKET")
	minioService := services.NewMinioService(minioClient)

	documentControlService := services.NewDocumentControlService(minioClient, bucketName, minioService)

	return &DocumentControlController{Service: documentControlService}
}

func (c *DocumentControlController) CreateDocumentControl(ctx *fiber.Ctx) error {
	// Get the username of the requester from the context (set by JWT middleware)
	requesterUsername := ctx.Locals("username").(string)

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

	var req services.DocumentControlPayload
	err := ctx.BodyParser(&req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"error":      err.Error(),
		})
	}

	// Add user_id
	req.CreatedBy = userID

	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType
	var casbinRuleTemp models.CasbinRule

	// Find the document category by UUID
	if err := config.DB.Where("id = ?", req.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
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
	if err := config.DB.Where("id = ?", req.DocumentTypeID).First(&typeDocument).Error; err != nil {
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

	if err := config.DB.Where("v1 = ? AND v2 = ? AND v4 = ?", "document", "draft", typeDocument.Prefix).First(&casbinRuleTemp).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Casbin rule temp not found for prefix: %s, skipping permission check.", typeDocument.Prefix)
		}
	}

	enforcer := helpers.GetCasbinEnforcer()
	log.Printf("Skip Casbin permissions ID: %v", casbinRuleTemp.ID)
	log.Printf("Debug Casbin: %v, %v, %v, %v, %v, %v", requesterUsername, "document", "draft", categoryDocument.Prefix, typeDocument.Prefix, "none")

	if casbinRuleTemp.ID == 0 {
		req.SkipCheck = "yes"
	}
	if casbinRuleTemp.ID != 0 { // Periksa apakah casbinRuleTemp valid sebelum melanjutkan
		// Get Casbin enforcer
		hasAccess, err := enforcer.Enforce(requesterUsername, "document", "draft", categoryDocument.Prefix, typeDocument.Prefix, "none")
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
	}

	// Process file from form-data
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "File upload failed",
			"detail":     err.Error(),
		})
	}

	// Call service to create DocumentControl and save the initial document version
	documentControl, documentVersion, err := c.Service.AddDocumentControlWithVersion(&req, fileHeader)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"detail":     err.Error(),
		})
	}

	enforcer = helpers.GetCasbinEnforcer()
	err = enforcer.LoadPolicy()
	if err != nil {
		log.Fatalf("Failed to load Casbin policies: %v", err)
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"message":    "Document control and initial version created successfully",
		"data": fiber.Map{
			"document_control": documentControl,
			"document_version": documentVersion,
		},
	})
}

// GetDocumentControls retrieves a paginated list of document controls with optional search filter
func (c *DocumentControlController) GetDocumentApprovalControls(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("page", "1")
	pageSizeStr := ctx.Query("perPage", "10")
	search := ctx.Query("search", "")
	documentTypeID := ctx.Query("document_type_id", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
		})
	}

	// Retrieve userID and userName from context
	userID := ctx.Locals("user_id").(int)       // Assuming userID is stored in context
	userName := ctx.Locals("username").(string) // Assuming userName is stored in context

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Retrieve the role from Casbin for the current user
	roles, err := enforcer.GetRolesForUser(userName)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Failed to retrieve roles for user %s", userName),
		})
	}

	if len(roles) == 0 {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    fmt.Sprintf("No roles found for user %s", userName),
		})
	}

	// Use the first role (modify logic if user can have multiple roles with priority)
	role := roles[0]

	// Call service to get paginated document controls
	result, err := c.Service.GetDocumentControlApprovalPaginated(currentPage, pageSize, search, role, userID, documentTypeID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document controls",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

// GetDocumentControls retrieves a paginated list of document controls with optional search filter
func (c *DocumentControlController) GetPaginatedDocumentControlAll(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("currentPage", "1")
	pageSizeStr := ctx.Query("pageSize", "10")
	search := ctx.Query("search", "")
	documentControlUUID := ctx.Params("uuid", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
		})
	}

	// Retrieve userID and userName from context
	userID := ctx.Locals("user_id").(int)       // Assuming userID is stored in context
	userName := ctx.Locals("username").(string) // Assuming userName is stored in context

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Retrieve the role from Casbin for the current user
	roles, err := enforcer.GetRolesForUser(userName)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Failed to retrieve roles for user %s", userName),
		})
	}

	if len(roles) == 0 {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    fmt.Sprintf("No roles found for user %s", userName),
		})
	}

	// Use the first role (modify logic if user can have multiple roles with priority)
	role := roles[0]

	// Call service to get paginated document controls
	result, err := c.Service.GetDocumentControlAllPaginated(currentPage, pageSize, search, role, userID, documentControlUUID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document controls",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

// GetDocumentControls retrieves a paginated list of document controls with optional search filter
func (c *DocumentControlController) GetListPermission(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("currentPage", "1")
	pageSizeStr := ctx.Query("pageSize", "10")
	search := ctx.Query("search", "")
	uuid := ctx.Params("uuid")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
		})
	}

	// Call service to get paginated document controls
	result, err := c.Service.GetListPermissionPaginated(currentPage, pageSize, search, uuid)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document controls permission",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

func (c *DocumentControlController) GetDocumentInternalControls(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("page", "1")
	pageSizeStr := ctx.Query("perPage", "10")
	search := ctx.Query("search", "")
	documentTypeID := ctx.Query("document_type_id", "")
	statusDocumentID := ctx.Query("status_document_id", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
		})
	}

	// Retrieve userID and userName from context
	userID := ctx.Locals("user_id").(int)       // Assuming userID is stored in context
	userName := ctx.Locals("username").(string) // Assuming userName is stored in context

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Retrieve the role from Casbin for the current user
	roles, err := enforcer.GetRolesForUser(userName)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Failed to retrieve roles for user %s", userName),
		})
	}

	if len(roles) == 0 {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    fmt.Sprintf("No roles found for user %s", userName),
		})
	}

	// Use the first role (modify logic if user can have multiple roles with priority)
	role := roles[0]

	// Call service to get paginated document controls
	result, err := c.Service.GetDocumentControlsInternalPaginated(currentPage, pageSize, search, role, userID, userName, documentTypeID, statusDocumentID)

	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document controls",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

// GetDocumentControls retrieves a paginated list of document controls with optional search filter
func (c *DocumentControlController) GetDocumentExternalControls(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("page", "1")
	pageSizeStr := ctx.Query("perPage", "10")
	search := ctx.Query("search", "")
	documentTypeID := ctx.Query("document_type_id", "")
	statusDocumentID := ctx.Query("status_document_id", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
		})
	}

	// Retrieve userID and userName from context
	userID := ctx.Locals("user_id").(int)       // Assuming userID is stored in context
	userName := ctx.Locals("username").(string) // Assuming userName is stored in context

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Retrieve the role from Casbin for the current user
	roles, err := enforcer.GetRolesForUser(userName)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Failed to retrieve roles for user %s", userName),
		})
	}

	if len(roles) == 0 {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    fmt.Sprintf("No roles found for user %s", userName),
		})
	}

	// Use the first role (modify logic if user can have multiple roles with priority)
	role := roles[0]

	// Call service to get paginated document controls
	result, err := c.Service.GetDocumentControlsExternalPaginated(currentPage, pageSize, search, role, userID, documentTypeID, statusDocumentID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document controls",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

func (c *DocumentControlController) GetDocumentControlByUUID(ctx *fiber.Ctx) error {
	uuidStr := ctx.Params("uuid")
	Username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)

	var casbinRule models.CasbinRule
	if err := config.DB.Where("ptype = ?", "g").Where("v0 = ?", Username).First(&casbinRule).Error; err != nil {
		return errors.New("failed to retrieve user role")
	}
	userRole := casbinRule.V1

	// Call service to get document control by UUID
	documentControl, err := c.Service.GetDocumentControlByUUID(uuidStr, userID, userRole)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Document control not found",
		})
	}

	// Query related entities
	var documentCategory models.CategoryDocument
	var documentType models.DocumentType
	var statusDocument models.StatusDocument
	// var documentControlCB models.DocumentControl
	var documentVersions []models.DocumentVersion

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&documentCategory).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Category document not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document category",
			"error":      err.Error(),
		})
	}

	// Query for status document
	if err := config.DB.Where("id = ?", documentControl.StatusDocumentID).First(&statusDocument).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Status document not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document status",
			"error":      err.Error(),
		})
	}

	// Query for document type
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&documentType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Type document not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document type",
			"error":      err.Error(),
		})
	}

	// if userRole != "admin" && userRole != "manajer-mutu" && userRole != "manajer-puncak" {
	// 	// Check ownership or permission
	// 	if err := config.DB.Where("created_by = ?", userID).Where("id = ?", documentControl.ID).First(&documentControlCB).Error; err != nil {
	// 		if errors.Is(err, gorm.ErrRecordNotFound) {
	// 			enforcer := helpers.GetCasbinEnforcer()
	// 			hasAccess, err := enforcer.Enforce(Username, "document-control", strings.ToLower(statusDocument.Name), documentCategory.Prefix, documentType.Prefix, "none")
	// 			if err != nil {
	// 				log.Printf("Error checking Casbin permissions: %v", err)
	// 				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 					"statusCode": fiber.StatusInternalServerError,
	// 					"message":    "Failed to check access permissions.",
	// 				})
	// 			}
	// 			if !hasAccess {
	// 				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
	// 					"statusCode": fiber.StatusForbidden,
	// 					"message":    "Forbidden: You don't have permission to access this resource.",
	// 				})
	// 			}
	// 		}
	// 	}
	// }

	if err := config.DB.Where("document_control_id = ?", documentControl.ID).Where("status_document_id = ?", 3).Where("is_latest = ?", 1).Find(&documentVersions).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document versions",
			"error":      err.Error(),
		})
	}

	// Add additional details to documentControl
	documentControlWithDetails := map[string]interface{}{
		"id":                       documentControl.ID,
		"uuid":                     documentControl.UUID,
		"document_name":            documentControl.DocumentName,
		"description":              documentControl.Description,
		"document_number":          documentControl.DocumentNumber,
		"clause_number":            documentControl.ClauseNumber,
		"revision_number":          documentControl.RevisionNumber,
		"publish_date":             documentControl.PublishDate,
		"page_count":               documentControl.PageCount,
		"created_at":               documentControl.CreatedAt,
		"updated_at":               documentControl.UpdatedAt,
		"deleted_at":               documentControl.DeletedAt,
		"document_type_id":         documentControl.DocumentTypeID,
		"document_category_id":     documentControl.DocumentCategoryID,
		"sequence_number":          documentControl.SequenceNumber,
		"status_document_id":       documentControl.StatusDocumentID,
		"created_by":               documentControl.CreatedBy,
		"document_type_name":       documentType.Name,
		"document_type_prefix":     documentType.Prefix,
		"document_category_name":   documentCategory.Name,
		"document_category_prefix": documentCategory.Prefix,
		"status_document_name":     statusDocument.Name,
		"is_creator":               *documentControl.CreatedBy == userID,
	}

	// fmt.Printf("Check is creator : %t\n", *documentControl.CreatedBy == userID)

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data": fiber.Map{
			"document_control":  documentControlWithDetails,
			"document_versions": documentVersions,
		},
	})
}

// DeleteDocumentControl deletes a document control by its UUID
func (c *DocumentControlController) DeleteDocumentControl(ctx *fiber.Ctx) error {
	uuidStr := ctx.Params("uuid")

	// Attempt to delete the document control
	if err := c.Service.DeleteDocumentControl(uuidStr); err != nil {
		// Log the error
		log.Printf("Error deleting document control with UUID %s: %v", uuidStr, err)

		// Return error message in the response
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
		})
	}

	// Log the successful deletion
	log.Printf("Successfully deleted document control with UUID %s", uuidStr)
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document control deleted successfully",
	})
}

// UpdateDocumentControl updates a document control by UUID
func (c *DocumentControlController) UpdateDocumentControl(ctx *fiber.Ctx) error {
	// Get the username of the requester from the context (set by JWT middleware)
	requesterUsername := ctx.Locals("username").(string)

	// Get the user_id from the context, ensuring the type is correct
	// var userID int
	// rawUserID := ctx.Locals("user_id")
	// if id, ok := rawUserID.(int); ok {
	// 	userID = id
	// } else {
	// 	log.Println("Error: user_id is not an integer")
	// 	return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"statusCode": fiber.StatusInternalServerError,
	// 		"message":    "Internal Server Error: Invalid user_id type",
	// 	})
	// }

	// Get UUID from the route parameter
	documentControlUUID := ctx.Params("uuid")
	if documentControlUUID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Document control UUID is required",
		})
	}

	var req services.DocumentControlPayload
	err := ctx.BodyParser(&req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    err.Error(),
			"error":      err.Error(),
		})
	}

	// Fetch the existing DocumentControl by UUID
	var existingDocumentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&existingDocumentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document control not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch document control",
			"detail":     err.Error(),
		})
	}

	// Fetch associated category and type documents
	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

	if err := config.DB.Where("id = ?", req.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Category document not found",
			"detail":     err.Error(),
		})
	}

	if err := config.DB.Where("id = ?", req.DocumentTypeID).First(&typeDocument).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Type document not found",
			"detail":     err.Error(),
		})
	}

	// Get Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the requeser has access to update the document
	hasAccess, err := enforcer.Enforce(requesterUsername, "document", "draft", categoryDocument.Prefix, typeDocument.Prefix, "none")
	if err != nil {
		log.Printf("Error checking Casbin permissions: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access permissions",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have permission to update this resource",
		})
	}

	// Update fields on the existing DocumentControl
	existingDocumentControl.DocumentNumber = req.DocumentNumber
	existingDocumentControl.DocumentName = req.DocumentName
	existingDocumentControl.Description = req.Description
	existingDocumentControl.DocumentCategoryID = services.IntPtr(req.DocumentCategoryID)
	existingDocumentControl.DocumentTypeID = services.IntPtr(req.DocumentTypeID)

	// Save the updated DocumentControl
	if err := config.DB.Save(&existingDocumentControl).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update document control",
			"detail":     err.Error(),
		})
	}

	// Deklarasikan variabel di luar blok if
	var documentControl *models.DocumentControl
	var updatedDocumentVersion *models.DocumentVersion

	// Process updated file from form-data, if present
	fileHeader, err := ctx.FormFile("file")
	if err == nil {
		documentControl, updatedDocumentVersion, err = c.Service.UpdateDocumentControlWithVersion(existingDocumentControl.UUID.String(), &req, fileHeader)
		if err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version",
				"detail":     err.Error(),
			})
		}
	}

	// Gunakan variabel dalam respons
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document updated successfully",
		"data": fiber.Map{
			"document_control": documentControl,
			"document_version": updatedDocumentVersion,
		},
	})

}

// GetLatestDocumentNameByUUID retrieves the document name where is_latest = 1 and document_control_id matches the UUID
func (c *DocumentControlController) GetLatestDocumentNameByUUID(ctx *fiber.Ctx) error {
	// Get the UUID from request params
	uuidStr := ctx.Params("uuid")
	username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)

	enforcer := helpers.GetCasbinEnforcer()
	roles, err := enforcer.GetRolesForUser(username)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Failed to retrieve roles for user %s", username),
		})
	}
	role := roles[0]

	// Query to find the document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", uuidStr).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document control not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document control",
			"error":      err.Error(),
		})
	}

	var documentVersion models.DocumentVersion
	if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").First(&documentVersion).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document version not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document version",
			"error":      err.Error(),
		})
	}

	var documentCategory models.CategoryDocument
	var documentType models.DocumentType

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&documentCategory).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document category: %w", err)
		}
		return fmt.Errorf("failed to find document category: %w", err)
	}

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&documentType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document type: %w", err)
		}
		return fmt.Errorf("failed to find document type: %w", err)
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data": fiber.Map{
			"document_name": documentControl.DocumentName,
			"casbin_check": fiber.Map{
				"role":       role,
				"rule":       "document",
				"action":     "view",
				"catPrefix":  documentCategory.Prefix,
				"typePrefix": documentType.Prefix,
				"docID":      documentControl.ID,
				"owner":      userID == *documentControl.CreatedBy,
			},
			"url_file": documentVersion.File,
		},
	})

}

// GetPresignedURL generates a presigned URL for previewing a file from its public MinIO URL
func (c *DocumentControlController) GetPresignedURL(ctx *fiber.Ctx) error {
	// username := ctx.Locals("username").(string)
	// userID := ctx.Locals("user_id").(int)
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

	var documentVersion models.DocumentVersion
	var documentControl models.DocumentControl
	var documentCategory models.CategoryDocument
	var documentType models.DocumentType

	if err := config.DB.Where("file = ?", body.URL).First(&documentVersion).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find file: %w", err)
		}
		return fmt.Errorf("failed to find file: %w", err)
	}

	if err := config.DB.Where("id = ?", documentVersion.DocumentControlID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document control: %w", err)
		}
		return fmt.Errorf("failed to find document control: %w", err)
	}

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&documentCategory).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document category: %w", err)
		}
		return fmt.Errorf("failed to find document category: %w", err)
	}

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&documentType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document type: %w", err)
		}
		return fmt.Errorf("failed to find document type: %w", err)
	}

	// enforcer := helpers.GetCasbinEnforcer()s
	// roles, err := enforcer.GetRolesForUser(username)

	// if roles[0] != "admin" {
	// 	if userID != *documentControl.CreatedBy {
	// 		// Get Casbin enforcer
	// 		enforcer := helpers.GetCasbinEnforcer()
	// 		// Check if the requester has access to create the document
	// 		hasAccess, err := enforcer.Enforce(username, "document", "view", documentCategory.Prefix, documentType.Prefix, "none")
	// 		if err != nil {
	// 			log.Printf("Error checking Casbin permissions: %v", err)
	// 			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 				"statusCode": fiber.StatusInternalServerError,
	// 				"message":    "Failed to check access permissions.",
	// 			})
	// 		}

	// 		// If the requester doesn't have access, return a forbidden status
	// 		if !hasAccess {
	// 			return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
	// 				"statusCode": fiber.StatusForbidden,
	// 				"message":    "Forbidden: You don't have permission to access this resource.",
	// 			})
	// 		}
	// 	}
	// }

	// Set expiration for the presigned URL (e.g., 60 seconds)
	expiration := int64(10)

	// Generate presigned URL
	presignedURL, err := c.Service.GeneratePresignedURLFromPublicURL(body.URL, expiration)
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

func (c *DocumentControlController) AddWatermarkFromURLHandler(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)
	// Ambil URL dari body request
	type RequestBody struct {
		URL string `json:"url"`
	}

	var body RequestBody
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if body.URL == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "URL is required",
		})
	}

	var documentVersion models.DocumentVersion
	var documentControl models.DocumentControl
	var documentCategory models.CategoryDocument
	var documentType models.DocumentType

	if err := config.DB.Where("file = ?", body.URL).First(&documentVersion).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find file: %w", err)
		}
		return fmt.Errorf("failed to find file: %w", err)
	}

	if err := config.DB.Where("id = ?", documentVersion.DocumentControlID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document control: %w", err)
		}
		return fmt.Errorf("failed to find document control: %w", err)
	}

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentCategoryID).First(&documentCategory).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document category: %w", err)
		}
		return fmt.Errorf("failed to find document category: %w", err)
	}

	// Query for category document
	if err := config.DB.Where("id = ?", documentControl.DocumentTypeID).First(&documentType).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find document type: %w", err)
		}
		return fmt.Errorf("failed to find document type: %w", err)
	}

	if userID != *documentControl.CreatedBy {
		// Get Casbin enforcer
		enforcer := helpers.GetCasbinEnforcer()
		// Check if the requester has access to create the document
		hasAccess, err := enforcer.Enforce(username, "document", "view", documentCategory.Prefix, documentType.Prefix, strconv.Itoa(documentControl.ID))
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
	}

	// Ambil watermark text dari query parameter
	watermarkText := ctx.Params("watermark")

	authHeader := ctx.Get("Authorization")
	if authHeader == "" {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header is required",
		})
	}

	// Ekstrak Bearer token dari Authorization header
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == authHeader { // Jika tidak ada prefix "Bearer "
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid Authorization header format",
		})
	}

	// Buat presigned URL
	expiry := 60 * time.Second
	presignedURL, err := c.Service.GeneratePresignedURLFromPublicURL(body.URL, int64(expiry.Seconds()))
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to generate presigned URL: %v", err),
		})
	}

	nameFile := generateRandomString(32)
	// Unduh file dari URL presigned
	tempFilePath := "./temp/" + nameFile + ".pdf"
	err = downloadFileFromPresignedURL(presignedURL, tempFilePath)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to download file: %v", err),
		})
	}

	// Output file path
	outputFile := "./temp/" + nameFile + "output_with_watermark.pdf"

	// Tambahkan watermark ke PDF
	err = c.Service.AddWatermarkToPDF(tempFilePath, outputFile, watermarkText)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to add watermark: %v", err),
		})
	}

	fileURL, err := c.Service.UploadFileToMinioFromLocalFile(outputFile, "document")
	if err != nil {
		log.Fatalf("Failed to upload file: %v", err)
	}
	log.Printf("File uploaded successfully: %s", fileURL)

	// Buat presigned URL
	expiry = 60 * time.Second
	presignedURL, err = c.Service.GeneratePresignedURLFromPublicURL(fileURL, int64(expiry.Seconds()))
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to generate presigned URL: %v", err),
		})
	}

	// Bersihkan file sementara
	defer os.Remove(tempFilePath)
	defer os.Remove(outputFile)

	// Sediakan file hasil dengan URL lokal
	// downloadURL := fmt.Sprintf("http://%s/static/%s", ctx.Hostname(), filepath.Base(outputFile))

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Watermark added successfully",
		"data":       presignedURL,
	})
}

func downloadFileFromPresignedURL(presignedURL, filePath string) error {
	client := &http.Client{}

	// Kirim permintaan GET
	fmt.Printf("Downloading from presigned URL: %s\n", presignedURL)
	req, err := http.NewRequest("GET", presignedURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	fmt.Printf("Response status code: %d\n", resp.StatusCode)
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("received non-200 response: %d, body: %s", resp.StatusCode, string(body))
	}

	// Pastikan direktori tujuan ada
	dir := filepath.Dir(filePath)
	fmt.Printf("Ensuring directory exists: %s\n", dir)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Simpan file ke disk
	fmt.Printf("Creating file at: %s\n", filePath)
	out, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	fmt.Println("Writing data to file...")
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	fmt.Printf("File saved successfully: %s\n", filePath)
	return nil
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	randomStr := make([]byte, length)
	for i := range randomStr {
		randomStr[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(randomStr)
}

// CreatePresignedURL generates a presigned URL for the given object key.
func CreatePresignedURL(minioClient *minio.Client, bucketName, objectKey string, expiry time.Duration) (string, error) {
	// Buat URL parameter kosong
	reqParams := url.Values{}

	// Buat presigned URL
	presignedURL, err := minioClient.PresignedGetObject(bucketName, objectKey, expiry, reqParams)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.String(), nil
}

func (c *DocumentControlController) ApproveDocumentControl(ctx *fiber.Ctx) error {
	documentControlUUID := ctx.Params("uuid")
	username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)

	var req struct {
		Note string `json:"note" validate:"required"`
	}
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Invalid request body " + err.Error(),
			"data":       nil,
		})
	}

	// Step 2: Retrieve the document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document control not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document control",
			"error":      err.Error(),
		})
	}

	// Step 3: Join to get the status document details
	var statusDocument models.StatusDocument
	if err := config.DB.Where("id = ?", documentControl.StatusDocumentID).First(&statusDocument).Error; err != nil {
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

	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

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

	// Step 4: Check user role and status document permissions
	var newStatusID int
	// var logNote string
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
				"message":    "Approval Manajer Mutu / Teknis is Needed",
			})
		}
		newStatusID = 2 // Assuming 2 is the ID for 'Approved'
		// logNote = "Status updated from Draft to Approved"

		var docVersionDraft models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").Where("status_document_id = ?", 1).First(&docVersionDraft).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ? AND status_document_id = ?", docVersionDraft.ID, 1).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

		documentLog := models.DocumentLog{
			UUID:              uuid.New(), // Generate UUID baru
			DocumentVersionID: &docVersionDraft.ID,
			StatusDocumentID:  &newStatusID,
			Date:              time.Now(), // PostgreSQL otomatis menyimpan hanya tanggal
			CreatedBy:         &userID,
			CreatedAt:         time.Now(),
			Note:              utils.StringPtr(req.Note),
		}

		if err := config.DB.Create(&documentLog).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to create document log",
				"error":      err.Error(),
			})
		}

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
				"message":    "Approval Manajer Puncak is Needed",
			})
		}

		newStatusID = 3 // Assuming 3 is the ID for 'Published'

		// logNote = "Status updated from Approved to Published"

		var docVersionApprove models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").Where("status_document_id = ?", 2).First(&docVersionApprove).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ? AND status_document_id = ?", docVersionApprove.ID, 2).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

		documentLog := models.DocumentLog{
			UUID:              uuid.New(), // Generate UUID baru
			DocumentVersionID: &docVersionApprove.ID,
			StatusDocumentID:  &newStatusID,
			Date:              time.Now(), // PostgreSQL otomatis menyimpan hanya tanggal
			CreatedBy:         &userID,
			CreatedAt:         time.Now(),
			Note:              utils.StringPtr(req.Note),
		}

		if err := config.DB.Create(&documentLog).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to create document log",
				"error":      err.Error(),
			})
		}

	case "Obsolete":

		var documentVersion models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").First(&documentVersion).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version" + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document version Not Found",
			})
		}

		var statusDocument models.StatusDocument
		if err := config.DB.Where("id = ?", documentVersion.StatusDocumentID).First(&statusDocument).Error; err != nil {
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

		enforcer := helpers.GetCasbinEnforcer()
		roles, err := enforcer.GetRolesForUser(username)
		if err != nil {
			log.Printf("Error fetching roles for user %s: %v", username, err)
		}

		log.Printf("Roles: %v, Status Document: %s, Category Prefix: %s, Type Prefix: %s",
			roles,
			statusDocument.Name,
			categoryDocument.Prefix,
			typeDocument.Prefix)

		// Check if the requester has access to create the document
		hasAccess, err := enforcer.Enforce(username, "document", strings.ToLower(statusDocument.Name), categoryDocument.Prefix, typeDocument.Prefix, "none")
		if err != nil {
			log.Printf("Error checking Casbin permissions: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to check access permissions.",
			})
		}

		// If the requester doesn't have access, return a forbidden status
		if !hasAccess {
			if statusDocument.Name == "Draft" {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Manajer Mutu / Teknis is Needed",
				})
			} else if statusDocument.Name == "Approved" {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Manajer Puncak is Needed",
				})
			} else {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Error Unknown status" + statusDocument.Name,
				})
			}
		}

		newStatusID = int(statusDocument.ID) + 1 // Assuming 3 is the ID for 'Published'
		var statusDocumentAfter models.StatusDocument

		if err := config.DB.Where("id = ?", newStatusID).First(&statusDocumentAfter).Error; err != nil {
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

		// logNote = "Status updated from " + statusDocument.Name + " to " + statusDocumentAfter.Name

		var docVersionObsolete models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").First(&docVersionObsolete).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ?", docVersionObsolete.ID).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

		documentLog := models.DocumentLog{
			UUID:              uuid.New(), // Generate UUID baru
			DocumentVersionID: &docVersionObsolete.ID,
			StatusDocumentID:  &newStatusID,
			Date:              time.Now(), // PostgreSQL otomatis menyimpan hanya tanggal
			CreatedBy:         &userID,
			CreatedAt:         time.Now(),
			Note:              utils.StringPtr(req.Note),
		}

		if err := config.DB.Create(&documentLog).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to create document log",
				"error":      err.Error(),
			})
		}

	default:
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Invalid document status for approval",
		})
	}

	// Update the document control status
	documentControl.StatusDocumentID = &newStatusID
	if err := config.DB.Save(&documentControl).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update document control status",
			"error":      err.Error(),
		})
	}

	// Step 6: Return success response
	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Document approved successfully",
		"data":       documentControl,
	})
}

func (c *DocumentControlController) RejectDocumentControl(ctx *fiber.Ctx) error {
	documentControlUUID := ctx.Params("uuid")
	username := ctx.Locals("username").(string)
	userID := ctx.Locals("user_id").(int)

	var req struct {
		Note string `json:"note" validate:"required"`
	}
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Invalid request body " + err.Error(),
			"data":       nil,
		})
	}

	// Step 2: Retrieve the document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"statusCode": fiber.StatusNotFound,
				"message":    "Document control not found",
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to retrieve document control",
			"error":      err.Error(),
		})
	}

	// Step 3: Join to get the status document details
	var statusDocument models.StatusDocument
	if err := config.DB.Where("id = ?", documentControl.StatusDocumentID).First(&statusDocument).Error; err != nil {
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

	var categoryDocument models.CategoryDocument
	var typeDocument models.DocumentType

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

	// Step 4: Check user role and status document permissions
	var newStatusID int
	// var logNote string
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
				"message":    "Reject by Manajer Mutu is Needed",
			})
		}
		newStatusID = 5 // Assuming 2 is the ID for 'Approved'
		// logNote = "Status updated from Draft to Reject"

		var docVersionDraft models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").Where("status_document_id = ?", 1).First(&docVersionDraft).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ? AND status_document_id = ?", docVersionDraft.ID, 1).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

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
				"message":    "Approval Manajer Puncak is Needed",
			})
		}

		newStatusID = 5 // Assuming 3 is the ID for 'Published'
		// logNote = "Status updated from Approved to Reject"

		var docVersionApprove models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").Where("status_document_id = ?", 2).First(&docVersionApprove).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ? AND status_document_id = ?", docVersionApprove.ID, 2).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

	case "Obsolete":

		var documentVersion models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").First(&documentVersion).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version" + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document version Not Found",
			})
		}

		var statusDocument models.StatusDocument
		if err := config.DB.Where("id = ?", documentVersion.StatusDocumentID).First(&statusDocument).Error; err != nil {
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

		// Check if the requester has access to create the document
		hasAccess, err := enforcer.Enforce(username, "document", strings.ToLower(statusDocument.Name), categoryDocument.Prefix, typeDocument.Prefix, "none")
		if err != nil {
			log.Printf("Error checking Casbin permissions: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to check access permissions.",
			})
		}

		// If the requester doesn't have access, return a forbidden status
		if !hasAccess {
			if statusDocument.Name == "Draft" {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Manajer Mutu is Needed",
				})
			} else if statusDocument.Name == "Approved" {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Manajer Puncak is Needed",
				})
			} else {
				return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"statusCode": fiber.StatusForbidden,
					"message":    "Error Unknown status" + statusDocument.Name,
				})
			}
		}

		newStatusID = 5 // Assuming 3 is the ID for 'Published'
		var statusDocumentAfter models.StatusDocument

		if err := config.DB.Where("id = ?", newStatusID).First(&statusDocumentAfter).Error; err != nil {
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

		// logNote = "Status updated from " + statusDocument.Name + " to " + statusDocumentAfter.Name

		var docVersionObsolete models.DocumentVersion
		// Find the document category by UUID
		if err := config.DB.Where("document_control_id = ?", documentControl.ID).Order("id DESC").First(&docVersionObsolete).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"statusCode": fiber.ErrNotFound,
					"message":    "document version " + err.Error(),
				})
			}
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.ErrNotFound,
				"message":    "Document Version Not Found",
			})
		}

		// Prepare the data to update
		updateData := map[string]interface{}{
			"status_document_id": newStatusID,
			"note":               req.Note, // Tambahkan note di sini
		}

		// Check and update the document version
		if err := config.DB.Model(&models.DocumentVersion{}).
			Where("id = ?", docVersionObsolete.ID).
			Updates(updateData).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"statusCode": fiber.StatusInternalServerError,
				"message":    "Failed to update document version status and note",
				"error":      err.Error(),
			})
		}

	default:
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Invalid document status for approval",
		})
	}

	// Update the document control status
	documentControl.StatusDocumentID = &newStatusID
	if err := config.DB.Save(&documentControl).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to update document control status",
			"error":      err.Error(),
		})
	}

	documentLog := models.DocumentLog{
		UUID:              uuid.New(), // Generate UUID baru
		DocumentVersionID: &documentControl.ID,
		StatusDocumentID:  &newStatusID,
		Date:              time.Now(), // PostgreSQL otomatis menyimpan hanya tanggal
		CreatedBy:         &userID,
		CreatedAt:         time.Now(),
		Note:              utils.StringPtr(req.Note),
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
		"message":    "Document rejected successfully",
		"data":       documentControl,
	})
}

func (d *DocumentControlController) GetLogsByUUIDHandler(c *fiber.Ctx) error {
	// Extract UUID from route parameter
	uuid := c.Params("uuid")
	if uuid == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "UUID parameter is required",
			"data":       nil,
		})
	}

	// Call the service function
	logs, err := services.GetLogsByDocumentControlUUID(uuid)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": http.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Respond with logs in JSON format
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"statusCode": http.StatusOK,
		"message":    "Logs retrieved successfully",
		"data":       logs,
	})
}

func (d *DocumentControlController) AddFilePermissionHandler(c *fiber.Ctx) error {
	// Extract UUID from route parameter
	uuid := c.Params("uuid")
	if uuid == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "UUID parameter is required",
			"data":       nil,
		})
	}

	// Parse the request body
	var req struct {
		Role   string `json:"role" validate:"required"`
		Action string `json:"action" validate:"required"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Invalid request body",
			"data":       nil,
		})
	}

	// Validate the request body
	if req.Role == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Role fields are required",
			"data":       nil,
		})
	}

	// Call the service function to add file permission
	err := services.AddFilePermission(uuid, req.Role)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": http.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Respond with success message
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"statusCode": http.StatusOK,
		"message":    "File permission added successfully",
		"data":       nil,
	})
}

func (d *DocumentControlController) DeleteFilePermissionHandler(c *fiber.Ctx) error {
	// Extract UUID from route parameter
	uuid := c.Params("uuid")
	if uuid == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "UUID parameter is required",
			"data":       nil,
		})
	}

	// Parse the request body
	var req struct {
		Role string `json:"role" validate:"required"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Invalid request body",
			"data":       nil,
		})
	}

	// Validate the request body
	if req.Role == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"statusCode": http.StatusBadRequest,
			"message":    "Role fields are required",
			"data":       nil,
		})
	}

	// Call the service function to delete the file permission
	err := services.DeleteFilePermission(uuid, req.Role)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": http.StatusInternalServerError,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Respond with success message
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"statusCode": http.StatusOK,
		"message":    "File permission deleted successfully",
		"data":       nil,
	})
}
