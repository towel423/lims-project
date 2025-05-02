package services

import (
	"backend-school/config"
	"backend-school/helpers"
	"backend-school/models"
	"context"
	"errors"
	"fmt"
	"log"
	"math"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"crypto/rand"
	"encoding/hex"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

type PublicationService struct {
	minioClient  *minio.Client
	minioService *MinioService
	bucketName   string
}

type UpdatePublicationRequest struct {
	CategoryID  uint    `json:"category_id" form:"category_id" validate:"required,numeric"` // Required and must be a number
	UUID        string  `json:"uuid" form:"uuid" validate:"required"`                       // Required
	Slug        string  `json:"slug" form:"slug" validate:"required"`                       // Required
	Status      string  `json:"status" form:"status"`                                       // Required, must be 1 or 2
	Img         *string `json:"img" form:"img"`                                             // Optional image file
	Description string  `json:"description" form:"description" validate:"required,min=10"`  // Required, min length 10
	Caption     string  `json:"caption" form:"caption"`                                     // Optional caption
	Title       string  `json:"title" form:"title" validate:"required,min=3"`               // Required, min length 3
	Position    string  `json:"position" form:"position" gorm:"default:'0'"`                // Optional position
}

// GenerateRandomString generates a random string of a given length
func GenerateRandomString(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func NewPublicationService(minioClient *minio.Client, bucketName string, minioService *MinioService) *PublicationService {
	return &PublicationService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

func (s *PublicationService) GetPublicationBySlug(slug string) (*models.Publication, error) {
	var publication models.Publication
	if err := config.DB.Preload("Category").Where("slug = ?", slug).Where("deleted_at", nil).First(&publication).Error; err != nil {
		return nil, err
	}
	return &publication, nil
}

func (s *PublicationService) GetPublicationByUUID(uuid string) (*models.Publication, error) {
	var publication models.Publication
	if err := config.DB.Preload("Category").Where("uuid = ?", uuid).Where("deleted_at", nil).First(&publication).Error; err != nil {
		return nil, err
	}
	return &publication, nil
}

func GetPublicationsByCategory(categorySlug string) ([]models.Publication, error) {
	var category models.Category
	var publication []models.Publication

	// First, find the category by its slug.
	if err := config.DB.Where("slug = ?", categorySlug).First(&category).Error; err != nil {
		return nil, err
	}

	// Then, find all publications that belong to this category.
	if err := config.DB.Where("category_id = ?", category.ID).Where("deleted_at", nil).Preload("Category").Find(&publication).Error; err != nil {
		return nil, err
	}

	return publication, nil
}

func (s *PublicationService) GetPublicationsPaginated(perPage, page int, sortBy string, sortDesc bool) (map[string]interface{}, error) {
	var publications []models.Publication
	var totalRecords int64
	var sortOrder string

	// Validasi input
	if perPage < 1 {
		perPage = 10
	}
	if page < 1 {
		page = 1
	}

	// Perhitungan offset
	offset := (page - 1) * perPage

	// Tentukan urutan sorting
	if sortDesc {
		sortOrder = sortBy + " DESC"
	} else {
		sortOrder = sortBy + " DESC"
	}

	// Hitung total records
	if err := config.DB.Model(&models.Publication{}).
		Where("deleted_at IS NULL").
		Count(&totalRecords).Error; err != nil {
		return nil, fmt.Errorf("failed to count publications: %v", err)
	}

	// Ambil data dengan pagination dan preload
	if err := config.DB.Model(&models.Publication{}).
		Where("deleted_at IS NULL").
		Order(sortOrder).
		Limit(perPage).
		Offset(offset).
		Preload("Category").
		Find(&publications).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch publications: %v", err)
	}

	// Hitung total halaman
	totalPages := int(math.Ceil(float64(totalRecords) / float64(perPage)))

	// Format hasil
	result := map[string]interface{}{
		"data":          publications,
		"current_page":  page,
		"per_page":      perPage,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

func (s *PublicationService) GetPublicationsCategoryPaginated(perPage, page int, sortBy string, sortDesc bool) (map[string]interface{}, error) {
	var categories []models.Category
	var totalRecords int64
	var sortOrder string

	// Calculate offset for pagination
	offset := (page) * perPage

	// Set the sort order based on the `sortDesc` flag
	if sortDesc {
		sortOrder = sortBy + " ASC"
	} else {
		sortOrder = sortBy + " DESC"
	}

	// Get the total number of records
	config.DB.Model(&models.Category{}).Count(&totalRecords)

	// Fetch the paginated data with sorting
	if err := config.DB.Where("deleted_at", nil).Order(sortOrder).Limit(perPage).Offset(offset).Find(&categories).Error; err != nil {
		return nil, errors.New("failed to fetch category publications")
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalRecords) / float64(perPage)))

	// Return the data in a paginated format
	result := map[string]interface{}{
		"data":          categories,
		"current_page":  page,
		"per_page":      perPage,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

// GetPublicationsByCategory fetches publications by their category slug
func (s *PublicationService) GetPublicationsByCategory(categorySlug string) ([]models.Publication, error) {
	var publications []models.Publication
	if err := config.DB.Where("publications.deleted_at", nil).Joins("JOIN categories ON categories.id = publications.category_id").
		Where("categories.slug = ?", categorySlug).Preload("Category").Find(&publications).Error; err != nil {
		return nil, errors.New("no publications found in this category")
	}
	return publications, nil
}

// CreatePublication handles the creation of a publication along with the image upload
func (s *PublicationService) CreatePublication(publication *models.Publication, img *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "publications", "id", "publication_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	newUUID := uuid.New().String()
	publication.UUID = newUUID

	if img != nil {
		// Generate a random string for the filename
		randomString, err := GenerateRandomString(8)
		// Generate a unique filename for the image to avoid name clashes
		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload the file to MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Set the image URL to the publication model
		publication.Img = &filePath
	}

	// Save the publication to the database
	if err := config.DB.Create(publication).Error; err != nil {
		return fmt.Errorf("failed to create publication: %v", err)
	}

	return nil
}

func (s *PublicationService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
	// Open the file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Upload the file to MinIO
	ctx := context.Background()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, src, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	// Set file to public-read using MinioService
	if err := s.minioService.SetFilePublicRead(fileName); err != nil {
		return "", fmt.Errorf("failed to set public-read policy: %v", err)
	}

	// Generate the file URL
	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil

}

// // UpdatePublication updates an existing publication by its UUID and handles image uploads
// func (s *PublicationService) UpdatePublication(uuid string, updatedPublication *models.Publication, img *multipart.FileHeader) error {
// 	var publication models.Publication

// 	// Fetch the existing publication by UUID
// 	if err := config.DB.Where("uuid = ?", uuid).First(&publication).Error; err != nil {
// 		return errors.New("publication not found")
// 	}

// 	// If an image is uploaded, handle the image update
// 	if img != nil {
// 		randomString, err := GenerateRandomString(8)
// 		// Generate a unique filename for the image to avoid name clashes
// 		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

// 		// Upload the file to MinIO
// 		filePath, err := s.saveFileToMinio(img, fileName)
// 		if err != nil {
// 			log.Printf("Error uploading file to MinIO: %v", err)
// 			return fmt.Errorf("failed to upload file to MinIO: %v", err)
// 		}

// 		// Update the image field in the publication object
// 		updatedPublication.Img = &filePath
// 	}

// 	log.Printf("Debug Payload : %v", updatedPublication)

// 	// Update the publication record with the new data
// 	if err := config.DB.Model(&publication).Updates(updatedPublication).Error; err != nil {
// 		return errors.New("failed to update publication")
// 	}

// 	return nil
// }

func (s *PublicationService) UpdatePublication(uuid string, updatedPublication UpdatePublicationRequest, img *multipart.FileHeader) error {
	var publication models.Publication

	// Fetch the existing publication by UUID
	if err := config.DB.Where("uuid = ?", uuid).First(&publication).Error; err != nil {
		return errors.New("publication not found")
	}

	// If an image is uploaded, handle the image update
	if img != nil {
		randomString, err := GenerateRandomString(8)
		if err != nil {
			return fmt.Errorf("failed to generate random string: %v", err)
		}

		// Generate a unique filename for the image to avoid name clashes
		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload the file to MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			log.Printf("Error uploading file to MinIO: %v", err)
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Update the image field in the publication object
		updatedPublication.Img = &filePath
	}

	// Log the updated payload for debugging
	log.Printf("Debug Payload: %+v", updatedPublication)

	// Validate the updated publication
	if err := validatePublication(updatedPublication); err != nil {
		return err // Handle validation error
	}

	// // Ensure the status is set to a valid value
	// if updatedPublication.Status == 0 { // Assuming 0 is the zero value
	// 	updatedPublication.Status = 1 // Set a default value or handle accordingly
	// }

	// Update the publication record with the new data
	if err := config.DB.Model(&publication).Updates(updatedPublication).Error; err != nil {
		return errors.New("failed to update publication")
	}

	return nil
}

// validatePublication checks if the publication fields are valid
func validatePublication(pub UpdatePublicationRequest) error {
	// Example validation logic
	if len(pub.Title) < 3 {
		return errors.New("title must be at least 3 characters long")
	}
	if len(pub.Description) < 10 {
		return errors.New("description must be at least 10 characters long")
	}
	if pub.Status != "1" && pub.Status != "0" {
		return errors.New("status must be either 1 or 0")
	}
	// Add more validations as needed
	return nil
}

func (s *PublicationService) DeletePublication(uuid string) error {
	// Get the current time for the soft delete
	currentTime := time.Now()

	// Update the DeletedAt field instead of deleting the record
	if err := config.DB.Model(&models.Publication{}).Where("uuid = ?", uuid).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete publication")
	}
	return nil
}
