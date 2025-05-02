package services

import (
	"backend-school/config"
	"backend-school/models"
	"backend-school/utils"
	"context"
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

// AdminDocumentRevisionService handles the business logic for admin document revisions
type AdminDocumentRevisionService struct {
	minioClient  *minio.Client
	bucketName   string
	minioService *MinioService
}

// NewAdminDocumentRevisionService initializes and returns a new AdminDocumentRevisionService instance
func NewAdminDocumentRevisionService(minioClient *minio.Client, bucketName string, minioService *MinioService) *AdminDocumentRevisionService {
	return &AdminDocumentRevisionService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

// DocumentRevisionResponse represents the structure of the response for document revisions
type DocumentRevisionResponse struct {
	UUID           string    `json:"uuid"`
	Version        string    `json:"version"`
	Note           string    `json:"note"`
	File           string    `json:"file"`
	StatusDocument string    `json:"status_document"`
	Description    string    `json:"description"`
	PageCount      *int      `json:"page_count"`
	Date           time.Time `json:"date"`
}

// PaginatedResultVersion represents a paginated result set
type PaginatedResultVersion struct {
	Data         interface{} `json:"data"`
	CurrentPage  int         `json:"current_page"`
	PerPage      int         `json:"per_page"`
	TotalPages   int         `json:"total_pages"`
	TotalRecords int64       `json:"total_records"`
}

// GetDocumentRevisionsPaginated retrieves a paginated list of document revisions
func (s *AdminDocumentRevisionService) GetDocumentRevisionsPaginatedPublished(
	currentPage, pageSize int,
	sortBy string, sortDesc bool,
	showAll bool, documentControlUUID string,
) (*PaginatedResultVersion, error) {

	var documentControl models.DocumentControl
	var documentVersions []struct {
		models.DocumentVersion
		StatusName string `gorm:"column:name"`
	}
	var totalRecords int64

	// Step 1: Retrieve document_control_id from document_control_uuid
	if err := config.DB.Model(&models.DocumentControl{}).
		Where("uuid = ?", documentControlUUID).
		First(&documentControl).Error; err != nil {
		return nil, errors.New("document_control_uuid not found")
	}
	documentControlID := documentControl.ID

	// Step 2: Calculate offset for pagination
	offset := (currentPage - 1) * pageSize

	// Step 3: Fetch total count of records filtered by document_control_id
	query := config.DB.Model(&models.DocumentVersion{}).
		Where("document_control_id = ?", documentControlID)
		// Where("status_document_id = ?", 3)

	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document revisions")
	}

	// Step 4: Fetch paginated records with join on status_document
	order := "ASC"
	if sortDesc {
		order = "DESC"
	}
	if err := query.Select("document_version.*, status_document.name AS name, document_version.updated_at as date").
		Joins("left join status_document on status_document.id = document_version.status_document_id").
		Offset(offset).
		Limit(pageSize).
		Order(sortBy + " " + order).
		Find(&documentVersions).Error; err != nil {
		return nil, errors.New("failed to fetch document revisions")
	}

	// Step 5: Transform records into response format
	var revisions []DocumentRevisionResponse
	for _, version := range documentVersions {
		revisions = append(revisions, DocumentRevisionResponse{
			UUID:           version.UUID.String(),
			Version:        version.Version,
			Note:           version.Note,
			File:           version.File,
			StatusDocument: version.StatusName, // Only display the status name
			Date:           version.UpdatedAt,
		})
	}

	// Step 6: Calculate total pages
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Step 7: Prepare paginated result
	result := &PaginatedResultVersion{
		Data:         revisions,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

// GetDocumentRevisionsPaginatedApproval retrieves a paginated list of document revisions with role-based filtering
func (s *AdminDocumentRevisionService) GetDocumentRevisionsPaginatedApproval(
	currentPage, pageSize int,
	sortBy string, sortDesc bool,
	showAll bool, documentControlUUID, username string,
) (*PaginatedResultVersion, error) {

	var documentControl models.DocumentControl
	var documentVersions []struct {
		models.DocumentVersion
		StatusName string `gorm:"column:name"`
	}
	var totalRecords int64

	// Step 2: Retrieve document_control_id from document_control_uuid
	if err := config.DB.Model(&models.DocumentControl{}).
		Where("uuid = ?", documentControlUUID).
		First(&documentControl).Error; err != nil {
		return nil, errors.New("document_control_uuid not found")
	}
	documentControlID := documentControl.ID

	// Step 3: Calculate offset for pagination
	offset := (currentPage - 1) * pageSize

	// Step 4: Build query for filtering based on role
	query := config.DB.Model(&models.DocumentVersion{}).
		Select("document_version.*, status_document.name AS name").
		Joins("LEFT JOIN status_document ON status_document.id = document_version.status_document_id").
		Where("document_control_id = ?", documentControlID)

	// Step 5: Fetch total count of filtered records
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document revisions")
	}

	// Step 6: Fetch paginated records with join on status_document
	order := "ASC"
	if sortDesc {
		order = "DESC"
	}
	if err := query.Select("document_version.*, status_document.name AS name").
		Offset(offset).
		Limit(pageSize).
		Order(sortBy + " " + order).
		Find(&documentVersions).Error; err != nil {
		return nil, errors.New("failed to fetch document revisions")
	}

	// Step 7: Transform records into response format
	var revisions []DocumentRevisionResponse
	for _, version := range documentVersions {
		revisions = append(revisions, DocumentRevisionResponse{
			UUID:           version.UUID.String(),
			Version:        version.Version,
			Note:           version.Note,
			File:           version.File,
			StatusDocument: version.StatusName, // Only display the status name
			Description:    version.Description,
			PageCount:      version.PageCount,
		})
	}

	// Step 8: Calculate total pages
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Step 9: Prepare paginated result
	result := &PaginatedResultVersion{
		Data:         revisions,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

func (s *AdminDocumentRevisionService) CreateDocumentRevision(
	documentControlUUID string,
	userID int,
	file *multipart.FileHeader,
	description string,
	pageCount int,
	documentNumber string,
) error {
	// Find document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Model(&models.DocumentControl{}).
		Where("uuid = ?", documentControlUUID).
		First(&documentControl).Error; err != nil {
		return errors.New("document_control_uuid not found")
	}

	// Get the latest document revision for this document control
	var latestRevision models.DocumentVersion
	if err := config.DB.Model(&models.DocumentVersion{}).
		Where("document_control_id = ?", documentControl.ID).
		Order("id DESC").
		First(&latestRevision).Error; err != nil {
		// If no revisions exist, start at version 1
		if errors.Is(err, gorm.ErrRecordNotFound) {
			latestRevision.Version = "00"
		} else {
			return fmt.Errorf("failed to fetch latest document revision: %v", err)
		}
	}

	// Calculate the new revision number
	// Mengonversi string ke integer
	versionInt, err := strconv.Atoi(latestRevision.Version)
	if err != nil {
		fmt.Println("Error converting version to integer:", err)
	}

	// Menambah nilai
	newRevisionNumber := versionInt + 1

	// Mengubah kembali ke string dengan padding nol (2 digit)
	newVersion := fmt.Sprintf("%02d", newRevisionNumber)

	fmt.Println("New version:", newVersion)

	// Upload file to MinIO
	fileURL, err := s.UploadDocumentFileToMinio(file, "document-revisions")
	if err != nil {
		return fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	// // Set StatusDocumentID based on CategoryID
	// var statusDocumentID *int
	// switch *documentControl.DocumentCategoryID {
	// case 1:
	// 	statusDocumentID = latestRevision.StatusDocumentID // Status for categoryID 1
	// case 2:
	// 	statusDocumentID = IntPtr(3) // Status for categoryID 2
	// default:
	// 	return fmt.Errorf("unsupported categoryID: %d", *documentControl.DocumentCategoryID)
	// }

	// Create a new document revision entry
	documentRevision := models.DocumentVersion{
		DocumentControlID: IntPtr(documentControl.ID),
		Version:           newVersion,
		// Note:              note,
		File:             fileURL,
		StatusDocumentID: IntPtr(1), // Assuming "1" is the status for "Draft"
		IsLatest:         IntPtr(1),
		Description:      description,
		PageCount:        &pageCount,
	}

	if err := config.DB.Model(&models.DocumentVersion{}).
		Where("document_control_id = ?", documentControl.ID).
		Update("is_latest", 0).Error; err != nil {
		return fmt.Errorf("failed to update is_latest for previous revisions: %v", err)
	}

	// Save the new document revision to the database
	if err := config.DB.Create(&documentRevision).Error; err != nil {
		return fmt.Errorf("failed to create document revision: %v", err)
	}

	sequenceNum, err := strconv.Atoi(documentControl.SequenceNumber)
	if err != nil {
		// Handle the error, e.g., log it or set a default value
		sequenceNum = 0 // Default to 0 if conversion fails
	} else {
		sequenceNum++
	}

	// Update the document control with new status obsolete
	documentControl.StatusDocumentID = IntPtr(4)
	switch documentControl.DocumentTypeID {
	case IntPtr(2):
		documentControl.SequenceNumber = strconv.Itoa(sequenceNum)
	case IntPtr(4):
		documentControl.SequenceNumber = strconv.Itoa(sequenceNum)
	case IntPtr(5):
		documentControl.SequenceNumber = strconv.Itoa(sequenceNum)
	}

	log.Printf("Document DEBUG : %v", documentNumber)

	// Update page_count and description
	documentControl.PageCount = pageCount
	documentControl.Description = description
	documentControl.DocumentNumber = documentNumber

	if err := config.DB.Save(&documentControl).Error; err != nil {
		return fmt.Errorf("failed to update document control: %v", err)
	}

	var documentCategory models.CategoryDocument
	var documentType models.DocumentType
	var roles []models.Role

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

	// Query for category document
	if err := config.DB.Where("is_approval = ?", 1).Find(&roles).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find role: %w", err)
		}
		return fmt.Errorf("failed to find role: %w", err)
	}

	// Iterate over roles and add an entry to Casbin for each role
	for _, role := range roles {
		// Step 5: Add entry to Casbin
		log.Println("Adding entry to Casbin for role:", role.Name)

		casbinRule := models.CasbinRule{
			Ptype: "p",
			V0:    role.GuardName,                        // Role or user
			V1:    "document",                            // Resource
			V2:    "view",                                // Action
			V3:    documentCategory.Prefix,               // Additional filter for category
			V4:    documentType.Prefix,                   // Additional filter for type
			V5:    fmt.Sprintf("%d", documentControl.ID), // Document identifier as string
		}

		// Attempt to create the CasbinRule entry
		if err := config.DB.Create(&casbinRule).Error; err != nil {
			log.Printf("Error saving CasbinRule for role %s: %v\n", role.Name, err)
		}

		log.Println("Successfully added entry to Casbin for role:", role.Name)
	}

	documentLog := models.DocumentLog{
		UUID:              uuid.New(), // Generate UUID baru
		DocumentVersionID: &documentRevision.ID,
		StatusDocumentID:  IntPtr(1),
		Date:              time.Now(), // PostgreSQL otomatis menyimpan hanya tanggal
		CreatedBy:         &userID,
		CreatedAt:         time.Now(),
		Note:              utils.StringPtr(description),
	}

	if err := config.DB.Create(&documentLog).Error; err != nil {
		log.Println("Successfully added entry to log")
	}

	return nil
}

// UploadDocumentFileToMinio uploads a file to MinIO for document revisions
func (s *AdminDocumentRevisionService) UploadDocumentFileToMinio(file *multipart.FileHeader, directory string) (string, error) {
	// Check if MinIO client is initialized
	if s.minioClient == nil {
		log.Println("Error: MinIO client is not initialized")
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	// Validate file size
	// const maxFileSize = 10 * 1024 * 1024 // 10 MB limit
	// if file.Size > maxFileSize {
	// 	return "", fmt.Errorf("file size exceeds maximum limit of %d bytes", maxFileSize)
	// }

	// // Validate file type
	// allowedMimeTypes := map[string]bool{
	// 	"application/pdf": true,
	// 	"image/jpeg":      true,
	// 	"image/png":       true,
	// }
	contentType := file.Header.Get("Content-Type")
	// if !allowedMimeTypes[contentType] {
	// 	return "", fmt.Errorf("unsupported file type: %s", contentType)
	// }

	// Open the file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate a unique file name
	fileName := fmt.Sprintf("%s/%s%s", directory, uuid.New().String(), filepath.Ext(file.Filename))

	// Upload the file to MinIO
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, src, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	// Generate public URL
	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)

	return fileURL, nil
}
