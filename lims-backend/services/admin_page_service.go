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

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type AdminPageService struct {
	minioClient *minio.Client
	bucketName  string
}

// AdminPageGenerateRandomString generates a random string of a given length
func AdminPageGenerateRandomString(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func NewAdminPageService() (*AdminPageService, error) {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	bucketName := os.Getenv("MINIO_BUCKET")

	// Initialize the MinIO client
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize MinIO client: %v", err)
	}

	// Return a new AdminPageService with the initialized MinIO client
	return &AdminPageService{
		minioClient: minioClient,
		bucketName:  bucketName,
	}, nil
}

func (s *AdminPageService) GetAdminPageBySlug(slug string) (*models.Page, error) {
	var page models.Page
	if err := config.DB.Where("slug = ?", slug).Where("deleted_at", nil).First(&page).Error; err != nil {
		return nil, err
	}
	return &page, nil
}

func (s *AdminPageService) GetAdminPageByUUID(uuid string) (*models.Page, error) {
	var page models.Page
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at", nil).First(&page).Error; err != nil {
		return nil, err
	}
	return &page, nil
}

func GetAdminPagesByCategory(categorySlug string) ([]models.Page, error) {
	var category models.Category
	var page []models.Page

	// First, find the category by its slug.
	if err := config.DB.Where("slug = ?", categorySlug).First(&category).Error; err != nil {
		return nil, err
	}

	// Then, find all pages that belong to this category.
	if err := config.DB.Where("category_id = ?", category.ID).Where("deleted_at", nil).Find(&page).Error; err != nil {
		return nil, err
	}

	return page, nil
}

// GetAdminPagesPaginated fetches paginated pages with sorting
func (s *AdminPageService) GetAdminPagesPaginated(perPage, page int, sortBy string, sortDesc bool) (map[string]interface{}, error) {
	var pages []models.Page
	var totalRecords int64
	var sortOrder string

	// Calculate offset for pagination
	offset := (page - 1) * perPage

	// Set the sort order based on the `sortDesc` flag
	if sortDesc {
		sortOrder = sortBy + " ASC"
	} else {
		sortOrder = sortBy + " DESC"
	}

	// Get the total number of records
	config.DB.Model(&models.Page{}).Count(&totalRecords)

	// Fetch the paginated data with sorting
	if err := config.DB.Where("deleted_at", nil).Order(sortOrder).Limit(perPage).Offset(offset).Find(&pages).Error; err != nil {
		return nil, errors.New("failed to fetch pages")
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalRecords) / float64(perPage)))

	// Return the data in a paginated format
	result := map[string]interface{}{
		"data":          pages,
		"current_page":  page,
		"per_page":      perPage,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

func (s *AdminPageService) GetAdminPagesCategoryPaginated(perPage, page int, sortBy string, sortDesc bool) (map[string]interface{}, error) {
	var categories []models.Category
	var totalRecords int64
	var sortOrder string

	// Calculate offset for pagination
	offset := (page - 1) * perPage

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
		return nil, errors.New("failed to fetch category pages")
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

// GetAdminPagesByCategory fetches pages by their category slug
func (s *AdminPageService) GetAdminPagesByCategory(categorySlug string) ([]models.Page, error) {
	var pages []models.Page
	if err := config.DB.Where("pages.deleted_at", nil).Where("pages.slug = ?", categorySlug).Find(&pages).Error; err != nil {
		return nil, errors.New("no pages found in this pages")
	}
	return pages, nil
}

// CreateAdminPage handles the creation of a page along with the image upload
func (s *AdminPageService) CreateAdminPage(page *models.Page, img *multipart.FileHeader) error {
	if img != nil {
		// Generate a random string for the filename
		randomString, err := AdminPageGenerateRandomString(8)
		// Generate a unique filename for the image to avoid name clashes
		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload the file to MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Set the image URL to the page model
		page.Image = filePath
	}

	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "pages", "id", "pages_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	// Save the page to the database
	if err := config.DB.Create(page).Error; err != nil {
		return fmt.Errorf("failed to create page: %v", err)
	}

	return nil
}

func (s *AdminPageService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
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

	// Generate the file URL
	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil

}

// UpdateAdminPage updates an existing page by its UUID and handles image uploads
func (s *AdminPageService) UpdateAdminPage(uuid string, updatedAdminPage *models.Page, img *multipart.FileHeader) error {
	var page models.Page

	// Fetch the existing page by UUID
	if err := config.DB.Where("uuid = ?", uuid).First(&page).Error; err != nil {
		return errors.New("page not found")
	}

	// If an image is uploaded, handle the image update
	if img != nil {
		randomString, err := AdminPageGenerateRandomString(8)
		// Generate a unique filename for the image to avoid name clashes
		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload the file to MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			log.Printf("Error uploading file to MinIO: %v", err)
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Update the image field in the page object
		updatedAdminPage.Image = filePath
	}

	// Update the page record with the new data
	if err := config.DB.Model(&page).Updates(updatedAdminPage).Error; err != nil {
		return errors.New("failed to update page")
	}

	return nil
}

func (s *AdminPageService) DeleteAdminPage(uuid string) error {
	// Get the current time for the soft delete
	currentTime := time.Now()

	// Update the DeletedAt field instead of deleting the record
	if err := config.DB.Model(&models.Page{}).Where("uuid = ?", uuid).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete page")
	}
	return nil
}
