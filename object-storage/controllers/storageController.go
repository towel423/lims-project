package controllers

import (
	"database/sql"
	"fmt"
	"object-storage/config"
	"object-storage/helpers"
	"object-storage/services"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

func UploadFile(c *fiber.Ctx) error {

	if config.DB == nil {
		return fmt.Errorf("database connection is not initialized")
	}

	exists, err := helpers.Permission(c)
	if err != nil {
		return helpers.SendResponse(c, nil, "Invalid Request", fiber.StatusInternalServerError)
	}

	if !exists {
		return helpers.SendResponse(c, nil, "Permission not granted", fiber.StatusBadRequest)
	}

	bucket := c.FormValue("bucket") // Ambil parameter bucket dari form data
	if bucket == "" {
		return helpers.SendResponse(c, nil, "Bucket parameter is required", fiber.StatusBadRequest)
	}

	storagePath := os.Getenv("STORAGE_PATH")
	if storagePath == "" {
		return helpers.SendResponse(c, nil, "STORAGE_PATH environment variable is not set", fiber.StatusInternalServerError)
	}

	path := filepath.Join(storagePath, bucket) // Ambil parameter path dari URL

	// Parse form data
	file, err := c.FormFile("file")
	if err != nil {
		return helpers.SendResponse(c, nil, "Failed to get file", fiber.StatusBadRequest)
	}

	name := c.FormValue("name")
	isPublic := c.FormValue("is_public")

	// Call service to save file
	filename, err := services.SaveFile(file, path, name, bucket, isPublic) // Pass path ke fungsi SaveFile
	if err != nil {
		return helpers.SendResponse(c, nil, err.Error(), fiber.StatusInternalServerError)
	}

	responseData := map[string]interface{}{
		"public":   isPublic == "yes",
		"filename": filename,
	}

	return helpers.SendResponse(c, responseData, "File uploaded successfully", fiber.StatusOK)
}

func GetFile(c *fiber.Ctx) error {
	filename := c.Params("filename")

	// Cari filename di log_object_storage
	isPublic, err := services.CheckFileVisibility(filename)
	if err != nil {
		return helpers.SendResponse(c, nil, "Error checking file visibility", fiber.StatusInternalServerError)
	}

	// Jika is_public adalah null, periksa secret
	if isPublic != nil && *isPublic != "yes" {
		secret := c.FormValue("secret")
		if secret == "" {
			return helpers.SendResponse(c, nil, "Secret is required for private files", fiber.StatusBadRequest)
		}

		// Verifikasi secret di setup_object_storage
		valid, err := services.VerifySecret(secret)
		if err != nil || !valid {
			return helpers.SendResponse(c, nil, "Invalid secret", fiber.StatusUnauthorized)
		}
	}

	accessKey, err := services.AccessKeyGenerator(filename)
	if err != nil {
		return helpers.SendResponse(c, nil, "Error generating access key", fiber.StatusInternalServerError)
	}

	basicUrl := os.Getenv("PUBLIC_URL")
	link := fmt.Sprintf("%s%s?access_key=%s", basicUrl, filename, accessKey) // Ganti dengan domain Anda

	return helpers.SendResponse(c, link, "Link success generated", fiber.StatusOK)
}

func OpenFile(c *fiber.Ctx) error {
	filename := c.Params("filename")
	accessKey := c.Query("access_key") // Mengambil access key dari query parameter

	// Mencari path file berdasarkan filename
	var path string
	query := "SELECT path FROM log_object_storage WHERE filename = $1"
	err := config.DB.QueryRow(query, filename).Scan(&path)
	if err != nil {
		if err == sql.ErrNoRows {
			return helpers.SendResponse(c, nil, "File not found", fiber.StatusNotFound)
		}
		return helpers.SendResponse(c, nil, "Error fetching path", fiber.StatusInternalServerError)
	}

	// Memeriksa apakah access key valid
	var attempt string
	query = "SELECT attempt FROM generated_files WHERE access_key = $1"
	err = config.DB.QueryRow(query, accessKey).Scan(&attempt)
	if err != nil {
		if err == sql.ErrNoRows {
			return helpers.SendResponse(c, nil, "Invalid access key", fiber.StatusBadRequest)
		}
		return helpers.SendResponse(c, nil, "Error checking access key", fiber.StatusInternalServerError)
	}

	// Update attempt to 1 (or increment if needed)
	// updateQuery := "UPDATE generated_files SET attempt = '1' WHERE access_key = $1"
	// _, err = config.DB.Exec(updateQuery, accessKey)
	// if err != nil {
	// 	return helpers.SendResponse(c, nil, err.Error(), fiber.StatusInternalServerError)
	// }

	if attempt == "0" {
		return c.SendFile(path, false)
	} else {
		return helpers.SendResponse(c, nil, "Cannot open file more than one", fiber.StatusInternalServerError)
	}

	// Mengirim file sebagai respons
	// false untuk tidak mengatur header Content-Disposition
}
