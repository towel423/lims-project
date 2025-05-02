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
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/gorm"
)

type AdminTestimonialService struct {
	minioClient *minio.Client
	bucketName  string
}

// GenerateRandomString generates a random string of a given length
// func GenerateRandomString(n int) (string, error) {
// 	bytes := make([]byte, n)
// 	if _, err := rand.Read(bytes); err != nil {
// 		return "", err
// 	}
// 	return hex.EncodeToString(bytes), nil
// }

func NewAdminTestimonialService() *AdminTestimonialService {
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
		panic(fmt.Sprintf("Failed to initialize MinIO client: %v", err))
	}

	return &AdminTestimonialService{
		minioClient: minioClient,
		bucketName:  bucketName,
	}
}

func (s *AdminTestimonialService) GetTestimonialByUUID(uuid string) (*models.Testimonial, error) {
	var testimonial models.Testimonial
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at IS NULL").First(&testimonial).Error; err != nil {
		return nil, err
	}
	return &testimonial, nil
}

// GetListPaginated fetches paginated testimonials with optional filtering by name
func (s *AdminTestimonialService) GetListPaginated(currentPage, pageSize int, search string) (map[string]interface{}, error) {
	var testimonials []models.Testimonial
	var totalRecords int64

	// Validasi input
	if currentPage < 1 {
		currentPage = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	// Perhitungan offset
	offset := (currentPage - 1) * pageSize

	// Query dasar
	query := config.DB.Model(&models.Testimonial{}).Where("deleted_at IS NULL")

	// Tambahkan filter pencarian jika ada
	if search != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(search)+"%")
	}

	// Hitung total records
	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, fmt.Errorf("failed to count testimonials: %v", err)
	}

	// Ambil data dengan pagination
	if err := query.Offset(offset).Limit(pageSize).Find(&testimonials).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch testimonials: %v", err)
	}

	// Hitung total halaman
	totalPages := int(math.Ceil(float64(totalRecords) / float64(pageSize)))

	// Hasil dalam format terstruktur
	result := map[string]interface{}{
		"data":          testimonials,
		"current_page":  currentPage,
		"per_page":      pageSize,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

// AddTestimonial creates a new testimonial and optionally uploads a photo
func (s *AdminTestimonialService) AddTestimonial(testimonial *models.Testimonial, photo *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "testimonials", "id", "testimonials_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	if photo != nil {
		randomString, err := GenerateRandomString(8)
		if err != nil {
			return fmt.Errorf("failed to generate random string for filename: %v", err)
		}

		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			return fmt.Errorf("failed to upload photo to MinIO: %v", err)
		}

		testimonial.Photo = filePath
		testimonial.ImageURL = filePath
	}

	testimonial.UUID = uuid.New()

	if err := config.DB.Create(testimonial).Error; err != nil {
		return fmt.Errorf("failed to create testimonial: %v", err)
	}

	return nil
}

func (s *AdminTestimonialService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	ctx := context.Background()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, src, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %v", err)
	}

	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil
}

func (s *AdminTestimonialService) UpdateTestimonialByUUID(uuid string, updatedTestimonial *models.Testimonial, photo *multipart.FileHeader) (*models.Testimonial, error) {
	var testimonial models.Testimonial

	// Cari testimonial berdasarkan UUID
	if err := config.DB.Where("uuid = ?", uuid).First(&testimonial).Error; err != nil {
		return nil, errors.New("testimonial not found")
	}

	// Jika foto baru diberikan, upload ke MinIO dan perbarui URL foto
	if photo != nil {
		randomString, err := GenerateRandomString(8)
		if err != nil {
			return nil, fmt.Errorf("failed to generate random string for filename: %v", err)
		}

		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			return nil, fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		updatedTestimonial.Photo = filePath
		updatedTestimonial.ImageURL = filePath
	}

	// Update kolom testimonial dengan data baru
	if err := config.DB.Model(&testimonial).Updates(updatedTestimonial).Error; err != nil {
		return nil, errors.New("failed to update testimonial")
	}

	// Memuat ulang data testimonial yang diperbarui
	if err := config.DB.Where("uuid = ?", uuid).First(&testimonial).Error; err != nil {
		return nil, errors.New("failed to load updated testimonial")
	}

	return &testimonial, nil
}

// DeleteTestimonial soft deletes a testimonial by setting the deleted_at timestamp
// DeleteTestimonial soft deletes a testimonial by setting the deleted_at timestamp
func (s *AdminTestimonialService) DeleteTestimonial(uuid string) error {
	currentTime := time.Now()

	// Cek apakah testimonial dengan UUID tersebut ada
	var testimonial models.Testimonial
	if err := config.DB.Where("uuid = ?", uuid).First(&testimonial).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("testimonial not found")
		}
		return errors.New("failed to check testimonial")
	}

	// Update kolom deleted_at untuk soft delete
	if err := config.DB.Model(&testimonial).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete testimonial")
	}

	return nil
}
