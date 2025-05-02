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
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/gorm"
)

type AdminPersonService struct {
	minioClient *minio.Client
	bucketName  string
}

// Inisialisasi AdminPersonService dan koneksi MinIO
func NewAdminPersonService() *AdminPersonService {
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
		panic(fmt.Sprintf("Failed to initialize MinIO client:"))
	}

	return &AdminPersonService{
		minioClient: minioClient,
		bucketName:  bucketName,
	}
}

// GetPersonByUUID fetches a Person based on UUID
func (s *AdminPersonService) GetPersonByUUID(uuid string) (*models.Person, error) {
	var person models.Person
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at IS NULL").First(&person).Error; err != nil {
		return nil, err
	}
	return &person, nil
}

// GetPersonsPaginated fetches paginated persons with optional filtering by name
func (s *AdminPersonService) GetPersonsPaginated(currentPage, pageSize int, search string) (map[string]interface{}, error) {
	var persons []models.Person
	var totalRecords int64

	offset := (currentPage) * pageSize

	query := config.DB.Model(&models.Person{}).Where("deleted_at IS NULL")
	if search != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+search+"%")
	}

	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count persons")
	}

	if err := query.Offset(offset).Limit(pageSize).Find(&persons).Error; err != nil {
		return nil, errors.New("failed to fetch persons")
	}

	totalPages := int(math.Ceil(float64(totalRecords) / float64(pageSize)))

	result := map[string]interface{}{
		"data":          persons,
		"current_page":  currentPage,
		"per_page":      pageSize,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

// AddPerson creates a new person and optionally uploads a photo to MinIO
func (s *AdminPersonService) AddPerson(person *models.Person, photo *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "person", "id", "person_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}
	// Jika foto ada, coba unggah ke MinIO
	if photo != nil {
		fileName := fmt.Sprintf("%s%s", uuid.NewString(), filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			// Log kesalahan tanpa menghentikan proses
			fmt.Printf("Warning: failed to upload photo to MinIO: %v\n", err)
			// Kosongkan ImageURL jika gagal
			person.ImageURL = ""
		} else {
			// Jika berhasil, simpan URL foto
			person.ImageURL = filePath
		}
	}

	person.UUID = uuid.New()

	if err := config.DB.Create(person).Error; err != nil {
		return fmt.Errorf("failed to create person in database:")
	}

	return nil
}

// UpdatePersonByUUID updates a person's information by UUID and optionally replaces the photo
func (s *AdminPersonService) UpdatePersonByUUID(uuid string, updatedPerson *models.Person, photo *multipart.FileHeader) (*models.Person, error) {
	var person models.Person

	// Cari person berdasarkan UUID
	if err := config.DB.Where("uuid = ?", uuid).First(&person).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("person not found")
		}
		return nil, fmt.Errorf("failed to find person:")
	}

	// Jika foto baru diberikan, upload ke MinIO dan perbarui URL foto
	if photo != nil {
		fileName := fmt.Sprintf("%s%s", uuid, filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			// Log kesalahan tanpa menghentikan proses
			fmt.Printf("Warning: failed to upload photo to MinIO: %v\n", err)
			// Pertahankan ImageURL yang lama jika pengunggahan gagal
			updatedPerson.ImageURL = person.ImageURL
		} else {
			// Jika berhasil, simpan URL foto baru
			updatedPerson.ImageURL = filePath
		}
	} else {
		// Jika foto tidak diberikan, pertahankan ImageURL yang lama
		updatedPerson.ImageURL = person.ImageURL
	}

	// Pertahankan UUID dan CreatedAt dari data lama
	updatedPerson.UUID = person.UUID
	updatedPerson.CreatedAt = person.CreatedAt

	// Update kolom person dengan data baru
	if err := config.DB.Model(&person).Updates(map[string]interface{}{
		"name":         updatedPerson.Name,
		"organization": updatedPerson.Organization,
		"quote":        updatedPerson.Quote,
		"image_url":    updatedPerson.ImageURL,
		"active":       updatedPerson.Active,
		"updated_at":   time.Now(),
	}).Error; err != nil {
		return nil, fmt.Errorf("failed to update person:")
	}

	// Memuat ulang data person yang diperbarui
	if err := config.DB.Where("uuid = ?", uuid).First(&person).Error; err != nil {
		return nil, fmt.Errorf("failed to load updated person:")
	}

	return &person, nil
}

// DeletePerson soft deletes a person by setting the deleted_at timestamp
func (s *AdminPersonService) DeletePerson(uuid string) error {
	currentTime := time.Now()

	// Cek apakah person dengan UUID tersebut ada
	var person models.Person
	if err := config.DB.Where("uuid = ?", uuid).First(&person).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("person not found")
		}
		return errors.New("failed to check person")
	}

	// Update kolom deleted_at untuk soft delete
	if err := config.DB.Model(&person).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete person")
	}

	return nil
}

// saveFileToMinio uploads a file to MinIO and returns the URL
func (s *AdminPersonService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file:")
	}
	defer src.Close()

	ctx := context.Background()
	_, err = s.minioClient.PutObject(ctx, s.bucketName, fileName, src, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO:")
	}

	fileURL := fmt.Sprintf("https://%s/%s/%s", os.Getenv("MINIO_ENDPOINT"), s.bucketName, fileName)
	return fileURL, nil
}
