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

type AdminTeamService struct {
	minioClient *minio.Client
	bucketName  string
}

// Initialize AdminTeamService and MinIO connection
func NewAdminTeamService() *AdminTeamService {
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

	return &AdminTeamService{
		minioClient: minioClient,
		bucketName:  bucketName,
	}
}

// GetTeamByUUID fetches a team by UUID
func (s *AdminTeamService) GetTeamByUUID(uuid string) (*models.Team, error) {
	var team models.Team
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at IS NULL").First(&team).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

// GetTeamsPaginated fetches paginated teams with optional name filtering
func (s *AdminTeamService) GetTeamsPaginated(currentPage, pageSize int, search string) (map[string]interface{}, error) {
	var teams []models.Team
	var totalRecords int64

	offset := (currentPage) * pageSize

	query := config.DB.Model(&models.Team{}).Where("deleted_at IS NULL")
	if search != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+search+"%")
	}

	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, errors.New("failed to count teams")
	}

	if err := query.Offset(offset).Limit(pageSize).Find(&teams).Error; err != nil {
		return nil, errors.New("failed to fetch teams")
	}

	totalPages := int(math.Ceil(float64(totalRecords) / float64(pageSize)))

	result := map[string]interface{}{
		"data":          teams,
		"current_page":  currentPage,
		"per_page":      pageSize,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

// AddTeam creates a new team and optionally uploads a photo to MinIO
func (s *AdminTeamService) AddTeam(team *models.Team, photo *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Ensure the sequence is correctly set to avoid conflicts
	if err := helpers.ResetSequenceToMax(db, "teachers", "id", "teachers_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	if photo != nil {
		fileName := fmt.Sprintf("%s%s", uuid.NewString(), filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			fmt.Printf("Warning: failed to upload photo to MinIO: %v\n", err)
			team.Photo = ""
		} else {
			team.Photo = filePath
		}
	}

	team.UUID = uuid.New()

	if err := config.DB.Create(team).Error; err != nil {
		return fmt.Errorf("failed to create team in database: %v", err)
	}

	return nil
}

// UpdateTeamByUUID updates a team by UUID and optionally replaces the photo
func (s *AdminTeamService) UpdateTeamByUUID(uuid string, updatedTeam *models.Team, photo *multipart.FileHeader) (*models.Team, error) {
	var team models.Team

	if err := config.DB.Where("uuid = ?", uuid).First(&team).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("team not found")
		}
		return nil, fmt.Errorf("failed to find team: %v", err)
	}

	// If a new photo is provided, upload it to MinIO and update the photo URL
	if photo != nil {
		fileName := fmt.Sprintf("%s%s", uuid, filepath.Ext(photo.Filename))
		filePath, err := s.saveFileToMinio(photo, fileName)
		if err != nil {
			fmt.Printf("Warning: failed to upload photo to MinIO: %v\n", err)
			updatedTeam.Photo = team.Photo
		} else {
			updatedTeam.Photo = filePath
		}
	} else {
		updatedTeam.Photo = team.Photo
	}

	// Keep original UUID and CreatedAt
	updatedTeam.UUID = team.UUID
	updatedTeam.CreatedAt = team.CreatedAt

	// Update team fields
	if err := config.DB.Model(&team).Updates(map[string]interface{}{
		"name":       updatedTeam.Name,
		"photo":      updatedTeam.Photo,
		"position":   updatedTeam.Position,
		"location":   updatedTeam.Location,
		"content":    updatedTeam.Content,
		"facebook":   updatedTeam.Facebook,
		"twitter":    updatedTeam.Twitter,
		"instagram":  updatedTeam.Instagram,
		"linkedin":   updatedTeam.Linkedin,
		"handphone":  updatedTeam.Handphone,
		"email":      updatedTeam.Email,
		"updated_at": time.Now(),
	}).Error; err != nil {
		return nil, fmt.Errorf("failed to update team: %v", err)
	}

	// Reload updated team
	if err := config.DB.Where("uuid = ?", uuid).First(&team).Error; err != nil {
		return nil, fmt.Errorf("failed to load updated team: %v", err)
	}

	return &team, nil
}

// DeleteTeam soft deletes a team by setting the deleted_at timestamp
func (s *AdminTeamService) DeleteTeam(uuid string) error {
	currentTime := time.Now()

	var team models.Team
	if err := config.DB.Where("uuid = ?", uuid).First(&team).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("team not found")
		}
		return errors.New("failed to check team")
	}

	if err := config.DB.Model(&team).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete team")
	}

	return nil
}

// saveFileToMinio uploads a file to MinIO and returns the URL
func (s *AdminTeamService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
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
