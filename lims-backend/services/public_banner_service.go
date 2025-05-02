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

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

type PublicBannerService struct {
	minioClient  *minio.Client
	bucketName   string
	minioService *MinioService
}

func NewBannerService(minioClient *minio.Client, bucketName string, minioService *MinioService) *PublicBannerService {
	return &PublicBannerService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

type PaginationResultBanner struct {
	Total       int64           `json:"total"`
	CurrentPage int             `json:"current_page"`
	PageSize    int             `json:"page_size"`
	Banners     []models.Banner `json:"data"`
}

func (s *PublicBannerService) GetBanners(currentPage, pageSize int, search string) (*PaginationResultBanner, error) {
	var banners []models.Banner
	var total int64

	offset := (currentPage - 1) * pageSize
	query := config.DB.Model(&models.Banner{})

	if search != "" {
		query = query.Where("LOWER(title) LIKE ?", "%"+search+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, err
	}

	// Tambahkan pengurutan berdasarkan id secara descending
	err = query.Where("deleted_at", nil).Order("id DESC").Limit(pageSize).Offset(offset).Find(&banners).Error
	if err != nil {
		return nil, err
	}

	return &PaginationResultBanner{
		Total:       total,
		CurrentPage: currentPage,
		PageSize:    pageSize,
		Banners:     banners,
	}, nil
}

// Where("deleted_at", nil).Order("id DESC")
// Admin Function
func (s *PublicBannerService) GetBannerBySlug(slug string) (*models.Banner, error) {
	var banner models.Banner
	if err := config.DB.Where("deleted_at", nil).Order("id DESC").Where("slug = ?", slug).First(&banner).Error; err != nil {
		return nil, err
	}
	return &banner, nil
}

func (s *PublicBannerService) GetBannerByUUID(uuid string) (*models.Banner, error) {
	var banner models.Banner
	if err := config.DB.Where("uuid = ?", uuid).First(&banner).Error; err != nil {
		return nil, errors.New("banner not found")
	}

	return &banner, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func (s *PublicBannerService) GetBannersPaginated(perPage, page int, sortBy string, sortDesc bool) (map[string]interface{}, error) {
	var banners []models.Banner
	var totalRecords int64
	var sortOrder string

	// Validasi input
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if sortBy == "" {
		sortBy = "created_at" // Default sorting by created_at
	}

	// Perhitungan offset
	offset := (page - 1) * perPage

	// Tentukan urutan sorting
	if sortDesc {
		sortOrder = sortBy + " DESC"
	} else {
		sortOrder = sortBy + " DESC"
	}

	// Hitung total data
	if err := config.DB.Model(&models.Banner{}).
		Where("deleted_at IS NULL"). // Pastikan Active adalah bool, bukan string
		Count(&totalRecords).Error; err != nil {
		return nil, fmt.Errorf("failed to count banners: %v", err)
	}

	// Ambil data dengan pagination
	if err := config.DB.Model(&models.Banner{}).
		Where("deleted_at IS NULL").
		Order(sortOrder).
		Limit(perPage).
		Offset(offset).
		Find(&banners).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch banners: %v", err)
	}

	// Ubah active dari bool ke int (1 atau 0)
	var formattedBanners []map[string]interface{}
	for _, banner := range banners {
		formattedBanners = append(formattedBanners, map[string]interface{}{
			"id":         banner.ID,
			"uuid":       banner.UUID,
			"title":      banner.Title,
			"subtitle":   banner.Subtitle,
			"link":       banner.Link,
			"image_url":  banner.ImageURL,
			"active":     boolToInt(banner.Active), // 🔹 Konversi `true` -> `1`, `false` -> `0`
			"created_at": banner.CreatedAt,
			"updated_at": banner.UpdatedAt,
		})
	}

	// Hitung total halaman
	totalPages := int(math.Ceil(float64(totalRecords) / float64(perPage)))

	// Format hasil
	result := map[string]interface{}{
		"data":          formattedBanners,
		"current_page":  page,
		"per_page":      perPage,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

// CreateBanner handles the creation of a banner along with the image upload
func (s *PublicBannerService) CreateBanner(banner *models.Banner, img *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "banners", "id", "banners_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	newUUID := uuid.New().String()
	banner.UUID = newUUID

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

		// Set the image URL to the banner model
		banner.ImageURL = &filePath
	}

	// Save the banner to the database
	if err := config.DB.Create(banner).Error; err != nil {
		return fmt.Errorf("failed to create banner: %v", err)
	}

	return nil
}

func (s *PublicBannerService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
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

func (s *PublicBannerService) UpdateBanner(uuid string, updatedBanner *models.Banner, img *multipart.FileHeader) error {
	var banner models.Banner

	// Fetch the existing banner by UUID
	if err := config.DB.Where("uuid = ?", uuid).First(&banner).Error; err != nil {
		return errors.New("banner not found")
	}

	// If an image is uploaded, handle the image update
	if img != nil {
		randomString, err := GenerateRandomString(8)
		if err != nil {
			log.Printf("Error generating random string: %v", err)
			return fmt.Errorf("failed to generate unique filename: %v", err)
		}

		// Generate a unique filename for the image
		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload the file to MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			log.Printf("Error uploading file to MinIO: %v", err)
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Update the image field in the banner object
		updatedBanner.ImageURL = &filePath
	} else {
		updatedBanner.ImageURL = banner.ImageURL
	}

	activeBool := updatedBanner.Active
	updatedBanner.Active = activeBool

	allowedFields := map[string]interface{}{
		"title":     updatedBanner.Title,
		"subtitle":  updatedBanner.Subtitle,
		"link":      updatedBanner.Link,
		"active":    activeBool, // ✅ Gunakan boolean yang sudah dikonversi
		"image_url": updatedBanner.ImageURL,
	}
	// Update the banner record with the new data
	if err := config.DB.Model(&banner).Updates(allowedFields).Error; err != nil {
		return errors.New("failed to update banner")
	}

	return nil
}

// DeleteBanner deletes a banner by its slug
func (s *PublicBannerService) DeleteBanner(uuid string) error {
	// Get the current time for the soft delete
	currentTime := time.Now()

	// Update the DeletedAt field instead of deleting the record
	if err := config.DB.Model(&models.Banner{}).Where("uuid = ?", uuid).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete banner")
	}
	// if err := config.DB.Model(&models.Banner{}).Where("id = ?", uuid).Update("deleted_at", currentTime).Error; err != nil {
	// 	return errors.New("failed to soft delete banner")
	// }
	return nil
}
