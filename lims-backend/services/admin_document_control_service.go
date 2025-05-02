package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"mime"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/utils"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
	"gorm.io/gorm"
)

type DocumentControlService struct {
	minioClient  *minio.Client
	bucketName   string
	minioService *MinioService
}

// NewDocumentControlService initializes and returns a new instance of DocumentControlService
func NewDocumentControlService(minioClient *minio.Client, bucketName string, minioService *MinioService) *DocumentControlService {
	return &DocumentControlService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

// Helper function to convert int to *int
func IntPtr(i int) *int {
	return &i
}

var validate = validator.New() // Initialize validator instance

// DocumentControlPayload defines the structure for the create and update request payload
type DocumentControlPayload struct {
	DocumentName       string `json:"document_name" form:"document_name" validate:"required"`
	Description        string `json:"description" form:"description" validate:"required"`
	DocumentNumber     string `json:"document_number" form:"document_number" validate:"required"`
	ClauseNumber       string `json:"clause_number" form:"clause_number"`
	RevisionNumber     string `json:"revision_number" form:"revision_number"`
	PublishDate        string `json:"publish_date" form:"publish_date" validate:"required,datetime=2006-01-02"`
	PageCount          int    `json:"page_count" form:"page_count"`
	DocumentTypeID     int    `json:"document_type_id" form:"document_type_id" validate:"required"`
	DocumentCategoryID int    `json:"document_category_id" form:"document_category_id" validate:"required"`
	SequenceNumber     string `json:"sequence_number" form:"sequence_number"`
	StatusDocumentID   int    `json:"status_document_id" form:"status_document_id" validate:"required"`
	Version            string `json:"version" form:"version"`
	CreatedBy          int    `json:"created_by"`
	SkipCheck          string `json:"-"`
}

// PaginatedResult is a struct to hold paginated data
type PaginatedResult struct {
	Data         interface{} `json:"data"`
	CurrentPage  int         `json:"current_page"`
	PerPage      int         `json:"per_page"`
	TotalPages   int         `json:"total_pages"`
	TotalRecords int64       `json:"total_records"`
}

type DocumentControlResponse struct {
	ID                 int        `json:"id"`
	UUID               uuid.UUID  `json:"uuid"`
	DocumentName       string     `json:"document_name"`
	Description        string     `json:"description"`
	DocumentNumber     string     `json:"document_number"`
	ClauseNumber       string     `json:"clause_number"`
	RevisionNumber     string     `json:"revision_number"`
	PublishDate        string     `json:"publish_date"` // Format this as Y-m-d
	PageCount          int        `json:"page_count"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	DeletedAt          *time.Time `json:"deleted_at"`
	DocumentTypeID     *int       `json:"document_type_id"`
	DocumentCategoryID *int       `json:"document_category_id"`
	SequenceNumber     string     `json:"sequence_number"`
	StatusDocumentID   *int       `json:"status_document_id"`
	CreatedBy          *int       `json:"created_by"`

	// Fields for joined data
	CategoryName   string `json:"category_name"`
	CategoryPrefix string `json:"category_prefix"`
	TypeName       string `json:"type_name"`
	TypePrefix     string `json:"type_prefix"`
	StatusName     string `json:"status_name"`
}

type DocumentControlResponseWithApproval struct {
	DocumentControlResponse
	ApprovalStatus bool `json:"approval_status"`
}

// Function to convert DocumentControl to DocumentControlResponse
func formatDocumentControl(doc models.DocumentControlJoined) DocumentControlResponse {
	return DocumentControlResponse{
		ID:                 doc.ID,
		UUID:               doc.UUID,
		DocumentName:       doc.DocumentName,
		Description:        doc.Description,
		DocumentNumber:     doc.DocumentNumber,
		ClauseNumber:       doc.ClauseNumber,
		RevisionNumber:     doc.RevisionNumber,
		PublishDate:        doc.PublishDate.Format("2006-01-02"), // Format as Y-m-d
		PageCount:          doc.PageCount,
		CreatedAt:          doc.CreatedAt,
		UpdatedAt:          doc.UpdatedAt,
		DeletedAt:          doc.DeletedAt,
		DocumentTypeID:     doc.DocumentTypeID,
		DocumentCategoryID: doc.DocumentCategoryID,
		SequenceNumber:     doc.SequenceNumber,
		StatusDocumentID:   doc.StatusDocumentID,
		CreatedBy:          doc.CreatedBy,
		CategoryName:       doc.CategoryName,
		CategoryPrefix:     doc.CategoryPrefix,
		TypeName:           doc.TypeName,
		TypePrefix:         doc.TypePrefix,
		StatusName:         doc.StatusName,
	}
}

type CasbinRuleResult struct {
	Role   string `json:"role"`
	Action string `json:"action"`
}

func (s *DocumentControlService) AddWatermarkToPDF(inputFile, outputFile, watermarkText string) error {
	// Validasi PDF untuk memastikan kompatibilitas
	log.Printf("Validating input file: %s", inputFile)
	err := api.ValidateFile(inputFile, nil)
	if err != nil {
		log.Printf("Validation failed: %v", err)
		return fmt.Errorf("input file validation failed: %w", err)
	}

	// Buat watermark berbasis teks
	log.Printf("Creating watermark with text: %s", watermarkText)
	wm, err := api.TextWatermark(watermarkText, "rot:45, scale:0.5, op:0.5", true, true, types.POINTS)
	if err != nil {
		log.Printf("Failed to create watermark: %v", err)
		return fmt.Errorf("failed to create watermark: %w", err)
	}
	if wm == nil {
		log.Printf("Watermark is nil!")
		return fmt.Errorf("failed to create watermark: wm is nil")
	}

	// Gunakan konfigurasi relaxed untuk menangani PDF versi tinggi
	// conf := &model.Configuration{ValidationMode: model.ValidationRelaxed}
	log.Printf("Starting to add watermark to file: %s", inputFile)
	err = api.AddWatermarksFile(inputFile, outputFile, nil, wm, nil)
	if err != nil {
		log.Printf("Failed to add watermark: %v", err)
		return fmt.Errorf("failed to add watermark: %w", err)
	}

	log.Printf("Watermark successfully added. Output file: %s", outputFile)
	fmt.Printf("Watermark successfully added to file: %s\n", outputFile)
	return nil
}

// SaveTemporaryFile saves the provided data to a temporary file.
func (s *DocumentControlService) SaveTemporaryFile(data []byte, filename string) (string, error) {
	tempFile, err := os.CreateTemp("", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer tempFile.Close()

	_, err = tempFile.Write(data)
	if err != nil {
		return "", fmt.Errorf("failed to write data to temporary file: %w", err)
	}

	return tempFile.Name(), nil
}

func GenerateDocumentNumber(prefixType, clauseNumber, documentName string) string {
	currentYear := time.Now().Year()
	documentNumber := fmt.Sprintf("LKAL %s %s/%d %s", prefixType, clauseNumber, currentYear, documentName)
	return documentNumber
}

func (s *DocumentControlService) AddDocumentControlWithVersion(payload *DocumentControlPayload, fileHeader *multipart.FileHeader) (*models.DocumentControl, *models.DocumentVersion, error) {
	// Validate and parse publish date
	if payload.PublishDate == "" {
		return nil, nil, fmt.Errorf("publish_date is required and cannot be empty")
	}

	publishDate, err := time.Parse("2006-01-02", payload.PublishDate)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid date format for publish_date: expected format is YYYY-MM-DD")
	}

	// Set StatusDocumentID based on CategoryID
	var statusDocumentID int
	switch payload.DocumentCategoryID {
	case 1:
		statusDocumentID = 1 // Status for categoryID 1
	case 2:
		if payload.DocumentTypeID == 2 {
			statusDocumentID = 1
		} else {
			statusDocumentID = 3 // Status for categoryID 2
		}
	default:
		return nil, nil, fmt.Errorf("unsupported categoryID: %d", payload.DocumentCategoryID)
	}

	if payload.SkipCheck == "yes" {
		statusDocumentID = 3
	}

	sequenceNumber := "1" // Default value
	if payload.SequenceNumber != "" {
		sequenceNumber = payload.SequenceNumber
	}

	var typeDocument models.DocumentType
	if payload.DocumentTypeID > 0 {
		if err := config.DB.Where("id = ?", payload.DocumentTypeID).First(&typeDocument).Error; err != nil {
			fmt.Errorf("error fetching type document: %w", err)
		}
	} else {
		errors.New("document control has no associated type document")
	}

	//get last nomor urut
	var documentTemp models.DocumentControl
	if err := config.DB.Order("id DESC").Where("document_type_id = ?", payload.DocumentTypeID).First(&documentTemp).Error; err != nil {
		fmt.Errorf("error fetching document: %w", err)
	}

	lastSequenceNumber := 1
	if documentTemp.SequenceNumber != "" {
		var err error
		lastSequenceNumber, err = strconv.Atoi(documentTemp.SequenceNumber)
		if err != nil {
			log.Printf("Warning: Error converting SequenceNumber to int, setting default to 0: %v", err)
			lastSequenceNumber = 1 // Reset ke 0 jika konversi gagal
		}
	} else {
		log.Println("Warning: SequenceNumber is empty, initializing with 1.")
	}
	// Increment the sequence number and assign it back to payload
	payload.SequenceNumber = strconv.Itoa(lastSequenceNumber + 1)

	newDocNumber := payload.DocumentNumber
	if payload.DocumentNumber == "" {
		// Generate nomor dokumen baru jika payload.DocumentNumber kosong
		newDocNumber = GenerateDocumentNumber(typeDocument.Prefix, payload.ClauseNumber, payload.DocumentName)
	}

	// Initialize DocumentControl instance
	documentControl := models.DocumentControl{
		UUID:               uuid.New(),
		DocumentName:       payload.DocumentName,
		Description:        payload.Description,
		DocumentNumber:     newDocNumber,
		ClauseNumber:       payload.ClauseNumber,
		RevisionNumber:     payload.RevisionNumber,
		PublishDate:        publishDate,
		PageCount:          payload.PageCount,
		DocumentTypeID:     IntPtr(payload.DocumentTypeID),
		DocumentCategoryID: IntPtr(payload.DocumentCategoryID),
		SequenceNumber:     sequenceNumber,
		StatusDocumentID:   IntPtr(statusDocumentID),
		CreatedBy:          IntPtr(payload.CreatedBy),
	}

	// Initialize an empty DocumentVersion instance outside the transaction block
	var documentVersion models.DocumentVersion

	// Start a transaction to ensure atomicity
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		// Step 1: Save DocumentControl to the database
		if err := tx.Create(&documentControl).Error; err != nil {
			return fmt.Errorf("failed to create document control: %w", err)
		}

		// Step 2: Upload file to MinIO
		filePath, err := s.UploadFileToMinio(fileHeader, "document-versions")
		if err != nil {
			// Capture the detailed error from uploadToMinio
			return fmt.Errorf("failed to upload file to MinIO: %w", err)
		}

		// Step 3: Initialize DocumentVersion for the initial version
		documentVersion = models.DocumentVersion{
			UUID:              uuid.New(),
			File:              filePath,
			DocumentControlID: &documentControl.ID,
			Version:           "00", // Initial version number
			StatusDocumentID:  IntPtr(1),
			IsLatest:          IntPtr(1),
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
			Description:       payload.Description,
			PageCount:         &payload.PageCount,
		}

		// Step 4: Save DocumentVersion to the database
		if err := tx.Create(&documentVersion).Error; err != nil {
			return fmt.Errorf("failed to create document version: %w", err)
		}

		// Step 5: Add entry to DocumentLog
		log.Println("Adding entry to DocumentLog")
		documentLog := models.DocumentLog{
			UUID:              uuid.New(), // Generate UUID baru
			DocumentVersionID: &documentVersion.ID,
			StatusDocumentID:  IntPtr(1), // Assuming 1 is the initial status
			Date:              time.Now(),
			CreatedBy:         IntPtr(payload.CreatedBy),
			CreatedAt:         time.Now(),
			Note:              utils.StringPtr("Document created with initial version"),
		}
		if err := tx.Create(&documentLog).Error; err != nil {
			log.Printf("Error saving DocumentLog: %v\n", err)
			return fmt.Errorf("failed to create document log: %w", err)
		}
		log.Println("Successfully added entry to DocumentLog")

		var documentCategory models.CategoryDocument
		var documentType models.DocumentType
		var getCasbinRule []models.CasbinRule

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
		if err := config.DB.Where("v1 = ?", "document").Where("v3 = ?", documentCategory.Prefix).Where("v4 = ?", documentType.Prefix).Where("v5 = ?", "none").Find(&getCasbinRule).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("failed to find role: %w", err)
			}
			return fmt.Errorf("failed to find role: %w", err)
		}

		// Iterate over roles and add an entry to Casbin for each role
		for _, role := range getCasbinRule {
			// Step 5: Add entry to Casbin
			log.Println("Checking and adding entry to Casbin for role:", role.V0)

			casbinRule := models.CasbinRule{
				Ptype: "p",
				V0:    role.V0,                               // Role or user
				V1:    "document",                            // Resource
				V2:    "view",                                // Action
				V3:    documentCategory.Prefix,               // Additional filter for category
				V4:    documentType.Prefix,                   // Additional filter for type
				V5:    fmt.Sprintf("%d", documentControl.ID), // Document identifier as string
			}

			// Check if the rule already exists
			var existingCasbinRule models.CasbinRule
			if err := tx.Where(&models.CasbinRule{
				Ptype: casbinRule.Ptype,
				V0:    casbinRule.V0,
				V1:    casbinRule.V1,
				V2:    casbinRule.V2,
				V3:    casbinRule.V3,
				V4:    casbinRule.V4,
				V5:    casbinRule.V5,
			}).First(&existingCasbinRule).Error; err == nil {
				// Rule already exists, skip creation
				log.Printf("CasbinRule already exists for role %s, skipping creation.\n", role.V0)
				continue
			} else if !errors.Is(err, gorm.ErrRecordNotFound) {
				// An unexpected error occurred
				log.Printf("Error checking CasbinRule for role %s: %v\n", role.V0, err)
				return fmt.Errorf("failed to check CasbinRule for role %s: %w", role.V0, err)
			}

			// Attempt to create the CasbinRule entry
			if err := tx.Create(&casbinRule).Error; err != nil {
				log.Printf("Error saving CasbinRule for role %s: %v\n", role.V0, err)
				return fmt.Errorf("failed to create CasbinRule for role %s: %w", role.V0, err)
			}

			log.Println("Successfully added entry to Casbin for role:", role.V0)
		}

		return nil
	})

	// If the transaction fails, return the detailed error to the caller
	if err != nil {
		return nil, nil, fmt.Errorf("transaction error: %w", err)
	}

	return &documentControl, &documentVersion, nil
}

func (s *DocumentControlService) UploadFileToMinio(file *multipart.FileHeader, directory string) (string, error) {
	// Check if MinIO client is initialized
	if s.minioClient == nil {
		log.Println("Error: MinIO client is not initialized")
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	// Validate file
	// const maxFileSize = 10 * 1024 * 1024 // 10 MB limit
	// if file.Size > maxFileSize {
	// 	return "", fmt.Errorf("file size exceeds maximum limit of %d bytes", maxFileSize)
	// }

	// allowedMimeTypes := map[string]bool{
	// 	"application/pdf": true,
	// 	"image/jpeg":      true,
	// 	"image/png":       true,
	// }
	contentType := file.Header.Get("Content-Type")
	// if !allowedMimeTypes[contentType] {
	// 	return "", fmt.Errorf("unsupported file type: %s", contentType)
	// }

	// Open file and prepare unique filename
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()
	fileName := fmt.Sprintf("%s/%s%s", directory, uuid.New().String(), filepath.Ext(file.Filename))

	// Upload to MinIO with a timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, src, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	// Set file to public-read
	// if err := s.minioService.SetFilePublicRead(fileName); err != nil {
	// 	return "", fmt.Errorf("failed to set public-read policy: %v", err)
	// }

	// Return public URL
	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil
}

func (s *DocumentControlService) UploadFileToMinioFromLocalFile(filePath, directory string) (string, error) {
	// Periksa apakah MinIO client diinisialisasi
	if s.minioClient == nil {
		log.Println("Error: MinIO client is not initialized")
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	// Validasi file
	// const maxFileSize = 10 * 1024 * 1024 // Batas 10 MB
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to get file info: %v", err)
	}

	// if fileInfo.Size() > maxFileSize {
	// 	return "", fmt.Errorf("file size exceeds maximum limit of %d bytes", maxFileSize)
	// }

	// Buka file
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	// Validasi tipe file
	// allowedMimeTypes := map[string]bool{
	// 	"application/pdf": true,
	// 	"image/jpeg":      true,
	// 	"image/png":       true,
	// }
	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	// if !allowedMimeTypes[contentType] {
	// 	return "", fmt.Errorf("unsupported file type: %s", contentType)
	// }

	// Siapkan nama file unik
	fileName := fmt.Sprintf("%s/%s%s", directory, uuid.New().String(), filepath.Ext(filePath))

	// Upload ke MinIO
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, file, fileInfo.Size(), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	// Set file menjadi public-read (opsional)
	// Uncomment jika Anda memiliki fungsi untuk mengatur kebijakan public-read
	// if err := s.minioService.SetFilePublicRead(fileName); err != nil {
	//     return "", fmt.Errorf("failed to set public-read policy: %v", err)
	// }

	// Kembalikan URL file publik
	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil
}

func (s *DocumentControlService) GetDocumentControlAllPaginated(currentPage, pageSize int, search string, role string, userID int, documentControlUUID string) (*PaginatedResult, error) {
	var documentControls []models.DocumentControlJoined
	var totalRecords int64

	offset := (currentPage - 1) * pageSize

	// Base query for fetching document controls with joins
	query := config.DB.Model(&models.DocumentControlJoined{}).
		Select("document_control.*, category_document.name AS category_name, category_document.prefix AS category_prefix, "+
			"document_type.name AS type_name, document_type.prefix AS type_prefix, "+
			"status_document.name AS status_name").
		Joins("LEFT JOIN category_document ON category_document.id = document_control.document_category_id").
		Joins("LEFT JOIN document_type ON document_type.id = document_control.document_type_id").
		Joins("LEFT JOIN status_document ON status_document.id = document_control.status_document_id").
		Where("document_control.status_document_id = ?", 3).
		Where("document_control.deleted_at IS NULL")

	var documentControlTemp models.DocumentControl
	if err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControlTemp).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errors.New("document control not found")
		}
		fmt.Errorf("error fetching document control: %w", err)
	}

	switch documentControlTemp.DocumentTypeID {
	case IntPtr(3):
		query = query.Where("document_control.document_type_id IN (?)", []int{2, 4})
	case IntPtr(2):
		query = query.Where("document_control.document_type_id IN (?)", []int{5, 6, 7, 8, 9, 10})
	}

	// // Apply role-specific filtering
	// if role == "administrator" || role == "teknisi" {
	// 	query = query.Where("document_control.created_by = ?", userID)
	// }

	// Apply search filter if provided
	if search != "" {
		query = query.Where("LOWER(document_control.document_name) LIKE ?", "%"+search+"%")
	}

	// Get total record count with applied filters
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document controls")
	}

	// Fetch paginated records
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&documentControls).Error; err != nil {
		return nil, errors.New("failed to fetch document controls")
	}

	// Convert each DocumentControl to DocumentControlResponse with formatted date
	var formattedControls []DocumentControlResponse
	for _, doc := range documentControls {
		formattedControls = append(formattedControls, formatDocumentControl(doc))
	}

	// Calculate total pages based on the record count and page size
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare the paginated result
	result := &PaginatedResult{
		Data:         formattedControls,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

func (s *DocumentControlService) GetDocumentControlApprovalPaginated(currentPage, pageSize int, search string, role string, userID int, documentTypeID string) (*PaginatedResult, error) {
	var documentControls []models.DocumentControlJoined
	var totalRecords int64

	offset := (currentPage - 1) * pageSize

	// Base query for fetching document controls with joins
	query := config.DB.Model(&models.DocumentControlJoined{}).
		Select("document_control.*, category_document.name AS category_name, category_document.prefix AS category_prefix, " +
			"document_type.name AS type_name, document_type.prefix AS type_prefix, " +
			"status_document.name AS status_name, " +
			"document_version.version AS revision_number").
		Joins("LEFT JOIN category_document ON category_document.id = document_control.document_category_id").
		Joins("LEFT JOIN document_type ON document_type.id = document_control.document_type_id").
		Joins("LEFT JOIN status_document ON status_document.id = document_control.status_document_id").
		Joins("LEFT JOIN document_version ON document_version.document_control_id = document_control.id AND document_version.is_latest = 1").
		Where("document_control.deleted_at IS NULL")

	// Apply role-specific filtering
	if role == "administrator" || role == "teknisi" {
		query = query.Where("document_control.created_by = ?", userID)
	}

	if documentTypeID != "" {
		query = query.Where("document_control.document_type_id = ?", documentTypeID)
	}

	switch role {
	case "manajer-mutu":
		// Query related entities
		var roleHasRules []models.RoleHasRule

		// Query for role and rules
		if err := config.DB.
			Where("role_guard_name = ? AND rule_policy = ? AND action = ?", role, "document", "draft").
			Where("type IS NOT NULL").
			Find(&roleHasRules).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("role has rule not found")
			}
			return nil, errors.New("failed to fetch role has rule")
		}

		// Kumpulkan nilai prefix untuk where in
		var arrPrefixType []string
		for _, rule := range roleHasRules {
			arrPrefixType = append(arrPrefixType, rule.Type) // Asumsi 'PrefixType' adalah field dalam RoleHasRule
		}

		// Pastikan arrPrefixType tidak kosong untuk menghindari kesalahan query
		if len(arrPrefixType) == 0 {
			return nil, errors.New("no valid prefix types found")
		}

		// Build the query
		query = query.
			Where("document_control.status_document_id IN ?", []int{1, 4}).
			Where("document_type.prefix IN ?", arrPrefixType).
			Where("document_version.status_document_id = ?", 1)

	case "manajer-teknis":
		// Query related entities
		var roleHasRules []models.RoleHasRule

		// Query for role and rules
		if err := config.DB.
			Where("role_guard_name = ? AND rule_policy = ? AND action = ?", role, "document", "draft").
			Where("type IS NOT NULL").
			Find(&roleHasRules).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("role has rule not found")
			}
			return nil, errors.New("failed to fetch role has rule")
		}

		// Kumpulkan nilai prefix untuk where in
		var arrPrefixType []string
		for _, rule := range roleHasRules {
			arrPrefixType = append(arrPrefixType, rule.Type) // Asumsi 'PrefixType' adalah field dalam RoleHasRule
		}

		// Pastikan arrPrefixType tidak kosong untuk menghindari kesalahan query
		if len(arrPrefixType) == 0 {
			return nil, errors.New("no valid prefix types found")
		}

		query = query.
			Where("document_control.status_document_id IN (?)", []int{1, 4}).
			Where("document_type.prefix IN ?", arrPrefixType).
			Where("document_version.status_document_id = ?", 1)
	case "manajer-puncak":
		query = query.
			Where("document_control.status_document_id IN (?)", []int{2, 4}).
			Where("document_version.status_document_id = ?", 2)
	}

	// Apply search filter if provided
	if search != "" {
		query = query.Where("LOWER(document_control.document_name) LIKE ?", "%"+search+"%")
	}

	// Get total record count with applied filters
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document controls")
	}

	// Fetch paginated records
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&documentControls).Error; err != nil {
		return nil, errors.New("failed to fetch document controls")
	}

	// Convert each DocumentControl to DocumentControlResponse with formatted date
	var formattedControls []DocumentControlResponse
	for _, doc := range documentControls {
		formattedControls = append(formattedControls, formatDocumentControl(doc))
	}

	// Calculate total pages based on the record count and page size
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare the paginated result
	result := &PaginatedResult{
		Data:         formattedControls,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

func (s *DocumentControlService) GetListPermissionPaginated(currentPage, pageSize int, search, uuid string) (*PaginatedResult, error) {
	var casbinRules []CasbinRuleResult
	var totalRecords int64

	// Validate pagination inputs
	if currentPage <= 0 || pageSize <= 0 {
		return nil, errors.New("invalid pagination parameters")
	}

	offset := (currentPage - 1) * pageSize

	// Fetch the document control record by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", uuid).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("document control not found")
		}
		return nil, fmt.Errorf("error fetching document control: %w", err)
	}

	// Convert documentControl.ID to string if necessary
	documentControlID := fmt.Sprintf("%v", documentControl.ID)

	// Base query to fetch casbin rules
	query := config.DB.Model(&models.CasbinRule{}).
		Select("v0 as role, v2 as action").
		Where("casbin_rule.v5 = ?", documentControlID)

	// Apply search filter if provided
	if search != "" {
		query = query.Where("LOWER(casbin_rule.v0) LIKE ?", "%"+strings.ToLower(search)+"%")
	}

	// Count total records with filters applied
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, fmt.Errorf("error counting casbin rules: %w", err)
	}

	// Fetch paginated data
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&casbinRules).Error; err != nil {
		return nil, fmt.Errorf("error fetching casbin rules: %w", err)
	}

	// Calculate total pages
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare the paginated result
	result := &PaginatedResult{
		Data:         casbinRules,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

func (s *DocumentControlService) GetDocumentControlsInternalPaginated(currentPage, pageSize int, search string, role string, userID int, username string, documentTypeID string, statusDocumentID string) (*PaginatedResult, error) {
	var totalRecords int64
	var documentControls []models.DocumentControlJoined
	var CasbinRule []models.CasbinRule

	offset := (currentPage - 1) * pageSize

	// Base query for fetching document controls with joins
	query := config.DB.Model(&models.DocumentControlJoined{}).
		Select("document_control.*, category_document.name AS category_name, category_document.prefix AS category_prefix, "+
			"document_type.name AS type_name, document_type.prefix AS type_prefix, "+
			"status_document.name AS status_name").
		Joins("LEFT JOIN category_document ON category_document.id = document_control.document_category_id").
		Joins("LEFT JOIN document_type ON document_type.id = document_control.document_type_id").
		Joins("LEFT JOIN status_document ON status_document.id = document_control.status_document_id").
		// Join casbin rules to check data
		// Joins("LEFT JOIN casbin_rule ON (casbin_rule.v1 = 'document' AND casbin_rule.v5 = document_control.id::text AND casbin_rule.v0 = ?)", role).
		// Joins("LEFT JOIN casbin_rule AS cr_read ON (casbin_rule.v1 = 'document' AND casbin_rule.v2 = 'read' AND casbin_rule.v0 = ?)", role).
		Where("document_control.document_category_id = ?", 1).
		Where("document_control.deleted_at IS NULL")

		// Fetching the CasbinRules from the database
	if err := config.DB.Where("v0 = ? AND v1 = 'document' AND v2 = 'read' AND v3 = 'DI'", role).Find(&CasbinRule).Error; err != nil {
		// Handle the error appropriately
		// return fmt.Errorf("error fetching type document: %w", err)
	}

	// Extracting the prefix from v4
	var typePrefix []string
	for _, rule := range CasbinRule {
		typePrefix = append(typePrefix, rule.V4) // Collecting prefixes from v4
	}

	query = query.Where("document_type.prefix IN ?", typePrefix)

	// Building the query based on the role
	// switch role {
	// case "teknisi":
	// 	query = query.Where("document_type.prefix IN ?", typePrefix)
	// case "user":
	// 	query = query.Where("document_type.prefix IN ?", typePrefix)
	// }

	// Apply role-specific filtering
	// if role != "admin" && role != "manajer-teknis" && role != "manajer-puncak" && role != "manajer-mutu" {
	// query = query.Where("document_control.created_by = ? AND casbin_rule.v0 IS NOT NULL", userID)
	// query = query.Where("(cr_read.v0 IS NOT NULL OR casbin_rule.v0 IS NOT NULL)")
	// }

	// Issue cek data
	// query = query.Where("document_control.document_number = ?", "LKAL-7-1/2024 PROSEDUR KAJI ULANG PERMINTAAN DAN KONTRAK")

	// Apply search filter if provided
	if search != "" {
		query = query.Where("LOWER(document_control.document_name) LIKE ?", "%"+search+"%")
	}

	if documentTypeID != "" {
		query = query.Where("document_control.document_type_id = ?", documentTypeID)
	}

	if statusDocumentID != "" {
		query = query.Where("document_control.status_document_id = ?", statusDocumentID)
	}

	// Get total record count with applied filters
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document controls")
	}

	// Fetch paginated records
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&documentControls).Error; err != nil {
		return nil, errors.New("failed to fetch document controls")
	}

	// Convert each DocumentControl to DocumentControlResponse with formatted date
	var formattedControls []DocumentControlResponseWithApproval
	enforcer := helpers.GetCasbinEnforcer()

	for _, doc := range documentControls {
		// username, "document", strings.ToLower(doc.StatusName), doc.CategoryPrefix, doc.TypePrefix, "none"
		// log.Printf("Logging enforcement parameters: username=%s, resource=%s, statusName=%s, categoryPrefix=%s, typePrefix=%s, action=%s",
		// 	username, "document", doc.StatusName, doc.CategoryPrefix, doc.TypePrefix, "none")

		if doc.StatusName != "Obsolete" {
			hasAccess, err := enforcer.Enforce(username, "document", strings.ToLower(doc.StatusName), doc.CategoryPrefix, doc.TypePrefix, "none")
			if err != nil {
				return nil, err // Handle errors during enforcement
			}

			// Convert model to response and add ApprovalStatus
			formattedControl := DocumentControlResponseWithApproval{
				DocumentControlResponse: formatDocumentControl(doc),
				ApprovalStatus:          hasAccess,
			}
			// Add the formatted control to the result slice
			formattedControls = append(formattedControls, formattedControl)
		} else {
			// Convert model to response and add ApprovalStatus
			formattedControl := DocumentControlResponseWithApproval{
				DocumentControlResponse: formatDocumentControl(doc),
				ApprovalStatus:          true,
			}
			// Add the formatted control to the result slice
			formattedControls = append(formattedControls, formattedControl)
		}

	}

	// Calculate total pages based on the record count and page size
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare the paginated result
	result := &PaginatedResult{
		Data:         formattedControls,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

func (s *DocumentControlService) GetDocumentControlsExternalPaginated(currentPage, pageSize int, search string, role string, userID int, documentTypeID string, statusDocumentID string) (*PaginatedResult, error) {
	var documentControls []models.DocumentControlJoined
	var totalRecords int64
	var CasbinRule []models.CasbinRule

	offset := (currentPage - 1) * pageSize

	// Base query for fetching document controls with joins
	query := config.DB.Model(&models.DocumentControlJoined{}).
		Select("document_control.*, category_document.name AS category_name, category_document.prefix AS category_prefix, "+
			"document_type.name AS type_name, document_type.prefix AS type_prefix, "+
			"status_document.name AS status_name").
		Joins("LEFT JOIN category_document ON category_document.id = document_control.document_category_id").
		Joins("LEFT JOIN document_type ON document_type.id = document_control.document_type_id").
		Joins("LEFT JOIN status_document ON status_document.id = document_control.status_document_id").
		// Joins("LEFT JOIN casbin_rule ON (casbin_rule.v1 = 'document' AND casbin_rule.v5 = document_control.id::text AND casbin_rule.v0 = ?)", role).
		// Joins("LEFT JOIN casbin_rule AS cr_read ON (casbin_rule.v1 = 'document' AND casbin_rule.v4 = 'read' AND casbin_rule.v0 = ?)", role).
		Where("document_control.document_category_id = ?", 2).
		Where("document_control.deleted_at IS NULL")

	// Apply role-specific filtering
	// if role == "administrator" || role == "teknisi" {
	// 	query = query.Where("document_control.created_by = ?", userID)
	// }
	// query = query.Where("(cr_read.v0 IS NOT NULL OR casbin_rule.v0 IS NOT NULL)")

	if err := config.DB.Where("v0 = ? AND v1 = 'document' AND v2 = 'read' AND v3 = 'DE'", role).Find(&CasbinRule).Error; err != nil {
		// Handle the error appropriately
		// return fmt.Errorf("error fetching type document: %w", err)
	}

	// Extracting the prefix from v4
	var typePrefix []string
	for _, rule := range CasbinRule {
		typePrefix = append(typePrefix, rule.V4) // Collecting prefixes from v4
	}

	query = query.Where("document_type.prefix IN ?", typePrefix)

	// Apply search filter if provided
	if search != "" {
		query = query.Where("LOWER(document_control.document_name) LIKE ?", "%"+search+"%")
	}

	if documentTypeID != "" {
		query = query.Where("document_control.document_type_id = ?", documentTypeID)
	}

	if statusDocumentID != "" {
		query = query.Where("document_control.status_document_id = ?", statusDocumentID)
	}

	// Get total record count with applied filters
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count document controls")
	}

	// Fetch paginated records
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&documentControls).Error; err != nil {
		return nil, errors.New("failed to fetch document controls")
	}

	// Convert each DocumentControl to DocumentControlResponse with formatted date
	var formattedControls []DocumentControlResponse
	for _, doc := range documentControls {
		formattedControls = append(formattedControls, formatDocumentControl(doc))
	}

	// Calculate total pages based on the record count and page size
	totalPages := int((totalRecords + int64(pageSize) - 1) / int64(pageSize))

	// Prepare the paginated result
	result := &PaginatedResult{
		Data:         formattedControls,
		CurrentPage:  currentPage,
		PerPage:      pageSize,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	return result, nil
}

// GetDocumentControlByUUID retrieves a DocumentControl by its UUID
func (s *DocumentControlService) GetDocumentControlByUUID(uuid string, userID int, userRole string) (*models.DocumentControl, error) {
	var documentControl models.DocumentControl

	// Struktur untuk menyimpan hasil join
	type Result struct {
		models.DocumentControl
		RevisionNumber string `gorm:"column:revision_number"`
	}

	var result Result

	query := config.DB.Table("document_control").
		Select("document_control.*, document_version.version as revision_number").
		Joins("LEFT JOIN document_version ON document_version.document_control_id = document_control.id").
		Where("document_version.is_latest = ?", 1).
		Where("document_control.uuid = ?", uuid).
		Where("document_control.deleted_at IS NULL")

	// Tambahkan filter untuk role administrator dan teknisi
	// if userRole == "administrator" || userRole == "teknisi" {
	// 	query = query.Where("document_control.created_by = ?", userID)
	// }

	// Eksekusi query
	if err := query.First(&result).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("document control not found")
		}
		return nil, err
	}

	// Map hasil join ke struct utama
	documentControl = result.DocumentControl
	documentControl.RevisionNumber = result.RevisionNumber

	return &documentControl, nil
}

// DeleteDocumentControl deletes a DocumentControl and its associated initial version file from MinIO
func (s *DocumentControlService) DeleteDocumentControl(uuid string) error {
	var documentControl models.DocumentControl
	var documentVersion models.DocumentVersion

	// Start a transaction to delete control and version data atomically
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Retrieve DocumentControl entry by UUID
		if err := tx.Where("uuid = ?", uuid).First(&documentControl).Where("status_document_id", 1).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("document control not found")
			}
			return fmt.Errorf("failed to retrieve document control: %w", err)
		}

		// Retrieve the related DocumentVersion
		if err := tx.Where("document_control_id = ?", documentControl.ID).First(&documentVersion).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("document version not found")
			}
			return fmt.Errorf("failed to retrieve document version: %w", err)
		}

		// Soft delete DocumentVersion entry
		if err := tx.Delete(&documentVersion).Error; err != nil {
			return fmt.Errorf("failed to delete document version: %w", err)
		}

		// Soft delete DocumentControl entry
		if err := tx.Delete(&documentControl).Error; err != nil {
			return fmt.Errorf("failed to delete document control: %w", err)
		}

		return nil
	})

	return err
}

func (s *DocumentControlService) UpdateDocumentControlWithVersion(uuid string, payload *DocumentControlPayload, fileHeader *multipart.FileHeader) (*models.DocumentControl, *models.DocumentVersion, error) {
	// Validate and parse publish date
	if payload.PublishDate == "" {
		return nil, nil, fmt.Errorf("publish_date is required and cannot be empty")
	}

	publishDate, err := time.Parse("2006-01-02", payload.PublishDate)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid date format for publish_date: expected format is YYYY-MM-DD")
	}

	// Fetch the existing DocumentControl by UUID
	var documentControl models.DocumentControl
	err = config.DB.Where("uuid = ?", uuid).First(&documentControl).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, fmt.Errorf("document control not found")
		}
		return nil, nil, fmt.Errorf("failed to fetch document control: %w", err)
	}

	log.Printf("Debug Document : %v\n", payload.DocumentNumber)

	// Update fields in DocumentControl based on the payload
	documentControl.DocumentName = payload.DocumentName
	documentControl.Description = payload.Description
	documentControl.DocumentNumber = payload.DocumentNumber
	documentControl.ClauseNumber = payload.ClauseNumber
	documentControl.RevisionNumber = payload.RevisionNumber
	documentControl.PublishDate = publishDate
	documentControl.PageCount = payload.PageCount
	documentControl.DocumentTypeID = IntPtr(payload.DocumentTypeID)
	documentControl.DocumentCategoryID = IntPtr(payload.DocumentCategoryID)
	documentControl.SequenceNumber = payload.SequenceNumber

	// Initialize an empty DocumentVersion instance (to update or create a new version)
	var documentVersion models.DocumentVersion
	var documentVersionLatest models.DocumentVersion

	if err := config.DB.Order("id DESC").Where("document_control_id = ?", *&documentControl.ID).First(&documentVersionLatest).Error; err != nil {
		fmt.Errorf("error fetching document version: %w", err)
	}

	// Start a transaction to ensure atomicity
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		// Step 1: Update DocumentControl in the database
		if err := tx.Save(&documentControl).Error; err != nil {
			return fmt.Errorf("failed to update document control: %w", err)
		}

		// If file is provided, update the document version
		if fileHeader != nil {
			// Step 2: Upload new file to MinIO
			filePath, err := s.UploadFileToMinio(fileHeader, "document-versions")
			if err != nil {
				return fmt.Errorf("failed to upload file to MinIO: %w", err)
			}

			// Step 3: Mark existing versions as not the latest
			if err := tx.Model(&models.DocumentVersion{}).
				Where("document_control_id = ?", documentControl.ID).
				Update("is_latest", 0).Error; err != nil {
				return fmt.Errorf("failed to update existing document versions: %w", err)
			}

			// Step 4: Create a new DocumentVersion for the updated version
			documentVersion = models.DocumentVersion{
				File:              filePath,
				DocumentControlID: &documentControl.ID,
				Version:           documentVersionLatest.Version, // Incremented version number
				StatusDocumentID:  IntPtr(1),                     // Assuming status is updated
				IsLatest:          IntPtr(1),                     // Mark as latest
				CreatedAt:         time.Now(),
				UpdatedAt:         time.Now(),
				Description:       payload.Description,
				PageCount:         &payload.PageCount,
			}

			if err := tx.Create(&documentVersion).Error; err != nil {
				return fmt.Errorf("failed to create new document version: %w", err)
			}

			// Step 5: Add entry to DocumentLog
			log.Println("Adding entry to DocumentLog")
			documentLog := models.DocumentLog{
				DocumentVersionID: &documentVersion.ID,
				StatusDocumentID:  IntPtr(1),
				Date:              time.Now(),
				CreatedAt:         time.Now(),
				Note:              utils.StringPtr("Document updated with a new version"),
			}
			if err := tx.Create(&documentLog).Error; err != nil {
				log.Printf("Error saving DocumentLog: %v\n", err)
				return fmt.Errorf("failed to create document log: %w", err)
			}
			log.Println("Successfully added entry to DocumentLog")
		}

		return nil
	})

	// If the transaction fails, return the detailed error to the caller
	if err != nil {
		return nil, nil, fmt.Errorf("transaction error: %w", err)
	}

	// If no new version is created, return only the updated DocumentControl
	if fileHeader == nil {
		return &documentControl, nil, nil
	}

	return &documentControl, &documentVersion, nil
}

// GeneratePresignedURLFromPublicURL generates a presigned URL for a public MinIO file URL
func (s *DocumentControlService) GeneratePresignedURLFromPublicURL(publicURL string, expiration int64) (string, error) {
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

func GetLogsByDocumentControlUUID(documentControlUUID string) ([]map[string]interface{}, error) {
	var documentControl models.DocumentControl

	// Step 1: Get DocumentControl by UUID
	err := config.DB.Where("uuid = ?", documentControlUUID).First(&documentControl).Error
	if err != nil {
		if err.Error() == "record not found" {
			log.Printf("DocumentControl with UUID %s not found\n", documentControlUUID)
			return nil, fmt.Errorf("document control not found")
		}
		log.Printf("Error fetching DocumentControl: %v\n", err)
		return nil, fmt.Errorf("failed to fetch document control: %w", err)
	}

	// Step 2: Get DocumentVersions by DocumentControl ID
	var documentVersions []models.DocumentVersion
	err = config.DB.Where("document_control_id = ?", documentControl.ID).Find(&documentVersions).Error
	if err != nil {
		log.Printf("Error fetching DocumentVersions: %v\n", err)
		return nil, fmt.Errorf("failed to fetch document versions: %w", err)
	}

	if len(documentVersions) == 0 {
		log.Printf("No DocumentVersions found for DocumentControl ID %d\n", documentControl.ID)
		return nil, fmt.Errorf("no document versions found for the given document control")
	}

	// Step 3: Extract IDs from DocumentVersions
	var documentVersionIDs []int
	for _, version := range documentVersions {
		documentVersionIDs = append(documentVersionIDs, version.ID)
	}

	log.Printf("Document Version IDs: %v", documentVersionIDs)

	// Step 4: Get logs with additional fields (joins)
	var logs []map[string]interface{}
	err = config.DB.Model(&models.DocumentLog{}).
		Select("document_log.uuid AS uuid, document_version.version, status_document.name AS status_name, users.username AS user_name, document_log.updated_at as date, document_log.note as catatan").
		Joins("JOIN document_version ON document_log.document_version_id = document_version.id").
		Joins("JOIN status_document ON document_log.status_document_id = status_document.id").
		Joins("JOIN users ON document_log.created_by = users.id").
		Where("document_log.document_version_id IN ?", documentVersionIDs).
		Order("document_log.updated_at DESC").
		Scan(&logs).Error
	if err != nil {
		log.Printf("Error fetching logs with joins: %v\n", err)
		return nil, fmt.Errorf("failed to fetch document logs with additional information: %w", err)
	}

	return logs, nil
}

func AddFilePermission(uuidParam string, role string) error {
	// Fetch the document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", uuidParam).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("document control not found")
		}
		return fmt.Errorf("error fetching document control: %w", err)
	}

	// Fetch category document
	var categoryDocument models.CategoryDocument
	if documentControl.DocumentCategoryID != nil {
		if err := config.DB.Where("id = ?", *documentControl.DocumentCategoryID).First(&categoryDocument).Error; err != nil {
			return fmt.Errorf("error fetching category document: %w", err)
		}
	} else {
		return errors.New("document control has no associated category document")
	}

	// Fetch type document
	var typeDocument models.DocumentType
	if documentControl.DocumentTypeID != nil {
		if err := config.DB.Where("id = ?", *documentControl.DocumentTypeID).First(&typeDocument).Error; err != nil {
			return fmt.Errorf("error fetching type document: %w", err)
		}
	} else {
		return errors.New("document control has no associated type document")
	}

	// Convert documentControl.ID to string for compatibility
	documentControlID := fmt.Sprintf("%v", documentControl.ID)

	// Check if CasbinRule already exists
	var existingRule models.CasbinRule
	if err := config.DB.Where("ptype = ? AND v0 = ? AND v1 = ? AND v2 = ? AND v3 = ? AND v4 = ?",
		"p", role, "document", "view", categoryDocument.Prefix, typeDocument.Prefix).
		First(&existingRule).Error; err == nil {
		// Rule already exists, skip creation
		return nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("error checking for existing casbin rule: %w", err)
	}

	// Create new CasbinRule
	casbinRule := models.CasbinRule{
		Ptype: "p",
		V0:    role,
		V1:    "document",
		V2:    "view",
		V3:    categoryDocument.Prefix,
		V4:    typeDocument.Prefix,
		V5:    documentControlID,
	}

	// Insert CasbinRule into database
	if err := config.DB.Create(&casbinRule).Error; err != nil {
		return fmt.Errorf("error creating casbin rule: %w", err)
	}

	return nil
}

func DeleteFilePermission(uuidParam, role string) error {
	// Fetch the document control by UUID
	var documentControl models.DocumentControl
	if err := config.DB.Where("uuid = ?", uuidParam).First(&documentControl).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("document control not found")
		}
		return fmt.Errorf("error fetching document control: %w", err)
	}

	// Convert documentControl.ID to string for compatibility with v5 (text column)
	// documentControlID := fmt.Sprintf("%v", documentControl.ID)

	// Delete CasbinRule matching the role, action, and document control ID
	if err := config.DB.Where("v0 = ? AND v1 = ?", role, "document").
		Delete(&models.CasbinRule{}).Error; err != nil {
		return fmt.Errorf("error deleting casbin rule: %w", err)
	}

	return nil
}
