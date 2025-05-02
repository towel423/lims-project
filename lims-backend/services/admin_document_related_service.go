package services

import (
	"backend-school/config"
	"backend-school/models"
	"context"
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

type DocumentRelatedService struct {
	minioClient  *minio.Client
	bucketName   string
	minioService *MinioService
}

// NewDocumentControlService initializes and returns a new instance of DocumentControlService
func NewDocumentRelatedService(minioClient *minio.Client, bucketName string, minioService *MinioService) *DocumentRelatedService {
	return &DocumentRelatedService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

type DocumentRelatedPayload struct {
	DocumentControlUUIDTarget string `json:"document_control_uuid_target" form:"document_control_uuid_target" validate:"required"`
	CreatedBy                 int    `json:"created_by" form:"created_by"`
}

// PaginatedResultDocRelated is a struct to hold paginated data
type PaginatedResultDocRelated struct {
	Data         interface{} `json:"data"`
	CurrentPage  int         `json:"current_page"`
	PerPage      int         `json:"per_page"`
	TotalPages   int         `json:"total_pages"`
	TotalRecords int64       `json:"total_records"`
}

// RelatedDocumentResponse represents the response structure for related documents
type RelatedDocumentResponse struct {
	UUID                string `json:"uuid"`
	DocumentControlUUID string `json:"document_control_uuid"`
	DocumentTypePrefix  string `json:"document_type_prefix"`
	NoDocument          string `json:"no_document"`
	FilePath            string `json:"file"`    // Properti untuk menyimpan path file
	Version             int    `json:"version"` // Properti untuk menyimpan versi dokumen
}

// CreateDocumentRelatedWithVersion handles the creation of document_control, document_version, and document_related
func (s *DocumentRelatedService) CreateLinkDocumentRelated(ctx *fiber.Ctx, documentControlUUID string, payload *DocumentRelatedPayload) (*models.DocumentRelated, error) {
	var documentControl models.DocumentControl
	// Query untuk documentControl
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to find document_control: %w", err)
		}
		return nil, fmt.Errorf("failed to find document_control: %w", err)
	}

	var documentControlTarget models.DocumentControl
	// Query untuk documentControlTarget
	if err := config.DB.Where("uuid = ?", payload.DocumentControlUUIDTarget).First(&documentControlTarget).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to find document_control: %w", err)
		}
		return nil, fmt.Errorf("failed to find document_control: %w", err)
	}

	// Cek apakah relasi sudah ada
	var existingRelation models.DocumentRelated
	err := config.DB.Where("document_id = ? AND document_id_related = ?", documentControl.ID, documentControlTarget.ID).First(&existingRelation).Error
	if err == nil {
		// Jika relasi sudah ada, kembalikan data relasi yang sudah ada
		log.Printf("Relation already exists between document ID %d and document ID %d", documentControl.ID, documentControlTarget.ID)
		return &existingRelation, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Jika ada error selain ErrRecordNotFound, kembalikan error
		return nil, fmt.Errorf("failed to check existing relation: %w", err)
	}

	// Buat entri baru di tabel DocumentRelated
	documentRelated := models.DocumentRelated{
		UUID:              uuid.New(),
		DocumentID:        &documentControl.ID,
		DocumentIDRelated: &documentControlTarget.ID,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := config.DB.Create(&documentRelated).Error; err != nil {
		log.Printf("Error creating document_related: %v", err)
		return nil, fmt.Errorf("failed to create document_related: %w", err)
	}

	// Buat entri reverse relasi
	documentRelatedReverse := models.DocumentRelated{
		UUID:              uuid.New(),
		DocumentID:        &documentControlTarget.ID,
		DocumentIDRelated: &documentControl.ID,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := config.DB.Create(&documentRelatedReverse).Error; err != nil {
		log.Printf("Error creating reverse document_related: %v", err)
		return nil, fmt.Errorf("failed to create reverse document_related: %w", err)
	}

	// Kembalikan entri yang baru dibuat
	return &documentRelated, nil
}

// RemoveLinkDocumentRelated handles the removal of document relationships
func (s *DocumentRelatedService) RemoveLinkDocumentRelated(ctx *fiber.Ctx, documentControlUUID string, payload *DocumentRelatedPayload) error {

	var documentRelatedData models.DocumentRelated
	// Query the source document
	if err := config.DB.Where("uuid = ?", payload.DocumentControlUUIDTarget).First(&documentRelatedData).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to find source document related: %w", err)
		}
		return fmt.Errorf("failed to find source document related: %w", err)
	}

	// Delete the relationship in the DocumentRelated table
	if err := config.DB.Where(
		"document_id = ? AND document_id_related = ?",
		documentRelatedData.DocumentID, documentRelatedData.DocumentIDRelated,
	).Delete(&models.DocumentRelated{}).Error; err != nil {
		log.Printf("Error deleting document_related: %v", err)
		return fmt.Errorf("failed to delete document_related: %w", err)
	}

	// Delete the reverse relationship in the DocumentRelated table
	if err := config.DB.Where(
		"document_id = ? AND document_id_related = ?",
		documentRelatedData.DocumentIDRelated, documentRelatedData.DocumentID,
	).Delete(&models.DocumentRelated{}).Error; err != nil {
		log.Printf("Error deleting reverse document_related: %v", err)
		return fmt.Errorf("failed to delete reverse document_related: %w", err)
	}

	// Return nil if both deletions were successful
	return nil
}

// uploadFileToMinio uploads a file to MinIO and returns the public URL
func (s *DocumentRelatedService) uploadFileToMinio(fileHeader *multipart.FileHeader, directory string) (string, error) {
	const maxFileSize = 10 * 1024 * 1024 // 10 MB limit
	if fileHeader.Size > maxFileSize {
		return "", fmt.Errorf("file size exceeds maximum limit of %d bytes", maxFileSize)
	}

	// allowedMimeTypes := map[string]bool{
	// 	"application/pdf": true,
	// }
	contentType := fileHeader.Header.Get("Content-Type")
	// if !allowedMimeTypes[contentType] {
	// 	return "", fmt.Errorf("unsupported file type: %s", contentType)
	// }

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	fileName := fmt.Sprintf("%s/%s%s", directory, uuid.New().String(), filepath.Ext(fileHeader.Filename))
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.MinioClient.PutObject(ctx, os.Getenv("MINIO_BUCKET"), fileName, src, fileHeader.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), os.Getenv("MINIO_BUCKET"), fileName)
	return fileURL, nil
}

func (s *DocumentRelatedService) GetPaginatedRelatedDocuments(ctx *fiber.Ctx, currentPageStr, pageSizeStr, documentControlUUID string) (*PaginatedResult, error) {
	// Parse pagination parameters
	currentPage, err := strconv.Atoi(currentPageStr)
	if err != nil || currentPage < 1 {
		return nil, fmt.Errorf("invalid currentPage parameter")
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		return nil, fmt.Errorf("invalid pageSize parameter")
	}

	offset := (currentPage - 1) * pageSize

	// Query related documents with joins
	var results []struct {
		UUID                string `json:"uuid"`
		DocumentControlUUID string `json:"document_control_uuid"`
		NoDocument          string `json:"no_document"`
		DocumentTypePrefix  string `json:"document_type_prefix"`
		File                string `json:"file"`
	}

	query := `
		SELECT 
			dr.uuid,
			dc.uuid AS document_control_uuid,
			dt.prefix AS document_type_prefix,
			res.document_number AS no_document,
			dv.file
		FROM document_related dr
		LEFT JOIN document_control dc ON dr.document_id_related = dc.id
		LEFT JOIN document_control res ON dr.document_id = res.id
		LEFT JOIN document_version dv ON res.id = dv.document_control_id
    LEFT JOIN document_type dt ON res.document_type_id = dt.id
		WHERE dc.uuid = ?
		AND dr.deleted_at IS NULL
		ORDER BY dr.id DESC
		LIMIT ? OFFSET ?;
	`

	if err := config.DB.Raw(query, documentControlUUID, pageSize, offset).Scan(&results).Error; err != nil {
		return nil, errors.New("failed to fetch related documents")
	}

	// Get total records count
	var totalRecords int64
	countQuery := `
		SELECT COUNT(*)
		FROM document_related dr
		LEFT JOIN document_control dc ON dr.document_id_related = dc.id
		WHERE dc.uuid = ?
		AND dr.deleted_at IS NULL;
	`
	if err := config.DB.Raw(countQuery, documentControlUUID).Scan(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count related documents")
	}

	// Calculate total pages
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare paginated result
	result := &PaginatedResult{
		Data:         results,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

// GeneratePresignedURLFromPublicURL generates a presigned URL for a public MinIO file URL
func (s *DocumentRelatedService) GeneratePresignedURLFromPublicURLDocRelated(publicURL string, expiration int64) (string, error) {
	// Parse the public URL
	parsedURL, err := url.Parse(publicURL)
	if err != nil {
		return "", errors.New("invalid public URL")
	}

	// Ensure the public URL contains the bucket and object path
	if !strings.Contains(parsedURL.Path, s.bucketName) {
		return "", errors.New("public URL does not belong to the configured bucket")
	}

	// Extract the object path (remove bucket name from path)
	objectPath := strings.TrimPrefix(parsedURL.Path, "/"+s.bucketName+"/")

	// Generate the presigned URL
	ctx := context.Background()
	reqParams := make(url.Values)
	presignedURL, err := s.minioClient.PresignedGetObject(
		ctx,
		s.bucketName,
		objectPath,
		time.Duration(expiration)*time.Second,
		reqParams,
	)
	if err != nil {
		return "", err
	}

	return presignedURL.String(), nil
}

// DeleteRelatedDocument performs a soft delete on a related document entry
func (s *DocumentRelatedService) DeleteRelatedDocument(documentRelatedUUID string) error {
	// Fetch the related document using the UUID
	var documentRelated models.DocumentRelated
	err := config.DB.Where("uuid = ?", documentRelatedUUID).First(&documentRelated).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("document related with UUID %s not found", documentRelatedUUID)
		}
		return fmt.Errorf("failed to fetch related document: %w", err)
	}

	// Fetch the associated control document
	var documentControl models.DocumentControl
	err = config.DB.Where("id = ?", documentRelated.DocumentID).First(&documentControl).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("document control with ID %d not found", *documentRelated.DocumentID)
		}
		return fmt.Errorf("failed to fetch control document: %w", err)
	}

	// Update the deleted_at field of document_control
	currentTime := time.Now()
	if err := config.DB.Model(&documentControl).Update("deleted_at", currentTime).Error; err != nil {
		return fmt.Errorf("failed to soft delete control document: %w", err)
	}

	// Update the deleted_at field of document_related
	if err := config.DB.Model(&documentRelated).Update("deleted_at", currentTime).Error; err != nil {
		return fmt.Errorf("failed to soft delete related document: %w", err)
	}

	return nil
}
