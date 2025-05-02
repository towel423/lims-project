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

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/minio/minio-go/v7"
)

type EventService struct {
	minioClient  *minio.Client
	bucketName   string
	minioService *MinioService
}

func NewEventService(minioClient *minio.Client, bucketName string, minioService *MinioService) *EventService {
	return &EventService{
		minioClient:  minioClient,
		bucketName:   bucketName,
		minioService: minioService,
	}
}

type PaginationResultEvent struct {
	Total       int64          `json:"total"`
	CurrentPage int            `json:"current_page"`
	PageSize    int            `json:"page_size"`
	Events      []models.Event `json:"data"`
}

func (s *EventService) GetEvents(currentPage, pageSize int, search string) (*PaginationResultEvent, error) {
	var events []models.Event
	var total int64

	offset := (currentPage) * pageSize
	query := config.DB.Model(&models.Event{})

	if search != "" {
		query = query.Where("LOWER(title) LIKE ?", "%"+search+"%").Where("deleted_at", nil)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, err
	}

	err = query.Where("deleted_at", nil).Order("id DESC").Limit(pageSize).Offset(offset).Find(&events).Error
	if err != nil {
		return nil, err
	}

	return &PaginationResultEvent{
		Total:       total,
		CurrentPage: currentPage,
		PageSize:    pageSize,
		Events:      events,
	}, nil
}

func (s *EventService) SearchBySlug(search string) (models.Event, error) {
	var event models.Event
	err := config.DB.First(&event, "slug = ?", search).Where("deleted_at", nil).Error
	return event, err
}

// Admin Function
func (s *EventService) GetEventBySlug(slug string) (*models.Event, error) {
	var event models.Event
	if err := config.DB.Where("deleted_at", nil).Order("id DESC").Where("slug = ?", slug).First(&event).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

func (s *EventService) GetEventByUUID(uuidOrID string) (map[string]interface{}, error) {
	var event models.Event
	// Query event by UUID
	if err := config.DB.Where("deleted_at", nil).Where("uuid = ?", uuidOrID).First(&event).Error; err != nil {
		return nil, err
	}

	// Prepare response
	response := map[string]interface{}{
		"id":          event.ID,
		"title":       event.Title,
		"category":    event.Category,
		"image_url":   event.ImageURL,
		"content":     event.Content,
		"description": event.Description,
		"start_date":  event.StartDate,
		"start_time":  event.StartTime,
		"end_date":    event.EndDate,
		"location":    event.Location,
		"slug":        event.Slug,
		"created_at":  event.CreatedAt,
		"updated_at":  event.UpdatedAt,
		"created_by":  event.CreatedBy,
		"updated_by":  event.UpdatedBy,
		"uuid":        event.UUID,
		"status":      mapStatusToInteger(event.Status), // Convert status to boolean
	}

	return response, nil
}

func mapStatusToInteger(status string) int {
	if status == "1" {
		return 1
	}
	return 0
}

func (s *EventService) GetEventsPaginated(perPage, page int, sortBy string, sortDesc bool, startDate, endDate string) (map[string]interface{}, error) {
	var events []models.Event
	var totalRecords int64
	var sortOrder string

	// Validasi input
	if perPage < 1 {
		perPage = 10 // Default per page
	}
	if page < 1 {
		page = 1 // Default page
	}

	// Perhitungan offset
	offset := (page - 1) * perPage

	// Tentukan urutan sorting
	if sortBy == "" {
		sortBy = "created_at" // Default sorting by created_at
	}
	if sortDesc {
		sortOrder = sortBy + " DESC"
	} else {
		sortOrder = sortBy + " DESC"
	}

	// Format yang sesuai untuk parsing tanggal
	const dateFormat = "2006-01-02"

	var parsedStartDate, parsedEndDate time.Time
	var err error

	// Parsing start_date
	if startDate != "" {
		parsedStartDate, err = time.Parse(dateFormat, startDate)
		if err != nil {
			log.Printf("Error parsing start_date: %v", err)
		} else {
			log.Printf("Parsed start_date: %s", parsedStartDate)
		}
	}

	// Parsing end_date
	if endDate != "" {
		parsedEndDate, err = time.Parse(dateFormat, endDate)
		if err != nil {
			log.Printf("Error parsing end_date: %v", err)
		} else {
			log.Printf("Parsed end_date: %s", parsedEndDate)
		}
	}

	// Hitung total records dengan filter tanggal jika ada
	query := config.DB.Model(&models.Event{}).Where("deleted_at IS NULL")
	if !parsedStartDate.IsZero() {
		query = query.Where("start_date >= ?", parsedStartDate)
	}
	if !parsedEndDate.IsZero() {
		query = query.Where("end_date <= ?", parsedEndDate)
	}

	if err := query.Count(&totalRecords).Error; err != nil {
		return nil, fmt.Errorf("failed to count events: %v", err)
	}

	// Ambil data dengan pagination dan filter tanggal
	if err := query.
		Order(sortOrder).
		Limit(perPage).
		Offset(offset).
		Find(&events).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch events: %v", err)
	}

	// Hitung total halaman
	totalPages := int(math.Ceil(float64(totalRecords) / float64(perPage)))

	// Format hasil
	result := map[string]interface{}{
		"data":          events,
		"current_page":  page,
		"per_page":      perPage,
		"total_pages":   totalPages,
		"total_records": totalRecords,
	}

	return result, nil
}

func (s *EventService) CreateEvent(event *models.Event, img *multipart.FileHeader) error {
	db, err := config.DB.DB()
	if err != nil {
		log.Printf("Failed to get database connection: %v", err)
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Reset sequence jika diperlukan
	if err := helpers.ResetSequenceToMax(db, "events", "id", "events_id_seq"); err != nil {
		log.Printf("Failed to reset sequence: %v", err)
		return fmt.Errorf("failed to reset sequence: %w", err)
	}

	// Generate UUID untuk event
	event.UUID = uuid.New().String()

	// Format start_date dan end_date jika tersedia
	if !event.StartDate.IsZero() {
		event.StartDate = event.StartDate.UTC()
	}
	if !event.EndDate.IsZero() {
		event.EndDate = event.EndDate.UTC()
	}
	//	if event.StartTime != "" {
	//		parsedStartTime, err := time.Parse("15:04", strings.TrimSpace(event.StartTime))
	//		if err != nil {
	//			return fmt.Errorf("invalid start_time format, use HH:mm: %w", err)
	//		}
	//		event.StartTime = parsedStartTime.Format("15:04")
	//	}

	// Handle file upload jika ada
	if img != nil {
		fileName := fmt.Sprintf("%s%s", uuid.New().String(), filepath.Ext(img.Filename))

		// Upload ke MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			return fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		event.ImageURL = filePath
	}

	// Simpan event ke database
	if err := config.DB.Create(event).Error; err != nil {
		// Periksa apakah error disebabkan oleh pelanggaran unique constraint
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			if strings.Contains(err.Error(), "events_slug_key") {
				return fiber.NewError(fiber.StatusBadRequest, "Event with the same slug already exists. Please use a unique slug.")
			}
		}
		log.Printf("Failed to create event: %v", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create event.")
	}

	return nil
}

func (s *EventService) saveFileToMinio(file *multipart.FileHeader, fileName string) (string, error) {
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

func (s *EventService) UpdateEvent(uuid string, updatedEvent *models.Event, img *multipart.FileHeader) (*models.Event, error) {
	var event models.Event

	// Cari event berdasarkan UUID
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at IS NULL").First(&event).Error; err != nil {
		log.Printf("Event not found with UUID: %s", uuid)
		return nil, errors.New("event not found")
	}

	// Jika ada gambar baru yang diupload, proses gambar
	if img != nil {
		randomString, err := GenerateRandomString(8)
		if err != nil {
			log.Printf("Error generating random string: %v", err)
			return nil, fmt.Errorf("failed to generate unique filename: %v", err)
		}

		fileName := fmt.Sprintf("%s%s", randomString, filepath.Ext(img.Filename))

		// Upload file ke MinIO
		filePath, err := s.saveFileToMinio(img, fileName)
		if err != nil {
			log.Printf("Error uploading file to MinIO: %v", err)
			return nil, fmt.Errorf("failed to upload file to MinIO: %v", err)
		}

		// Set URL gambar baru di objek updatedEvent
		updatedEvent.ImageURL = filePath
	} else {
		updatedEvent.ImageURL = event.ImageURL
	}

	log.Printf("Start Date: %v, End Date: %v, Start Time: %s", updatedEvent.StartDate, updatedEvent.EndDate, updatedEvent.StartTime)

	// Pastikan hanya field tertentu yang dapat di-update
	allowedFields := map[string]interface{}{
		"title":       updatedEvent.Title,
		"category":    updatedEvent.Category,
		"content":     updatedEvent.Content,
		"description": updatedEvent.Description,
		"start_date":  updatedEvent.StartDate,
		"start_time":  updatedEvent.StartTime,
		"end_date":    updatedEvent.EndDate,
		"location":    updatedEvent.Location,
		"slug":        updatedEvent.Slug,
		"image_url":   updatedEvent.ImageURL,
		"status":      updatedEvent.Status,
	}

	// Update data event
	if err := config.DB.Model(&event).Updates(allowedFields).Error; err != nil {
		log.Printf("Failed to update event with UUID %s: %v", uuid, err)
		return nil, errors.New("failed to update event")
	}

	// Ambil ulang data event dari database untuk memastikan semua field ter-update
	if err := config.DB.Where("uuid = ?", uuid).Where("deleted_at IS NULL").First(&event).Error; err != nil {
		log.Printf("Failed to reload updated event with UUID %s: %v", uuid, err)
		return nil, errors.New("failed to reload updated event")
	}

	// log.Printf("Event updated successfully: %+v", event)
	return &event, nil
}

// DeleteEvent deletes a event by its slug
func (s *EventService) DeleteEvent(uuid string) error {
	// Get the current time for the soft delete
	currentTime := time.Now()

	// Update the DeletedAt field instead of deleting the record
	if err := config.DB.Model(&models.Event{}).Where("uuid = ?", uuid).Update("deleted_at", currentTime).Error; err != nil {
		return errors.New("failed to soft delete event")
	}
	return nil
}
