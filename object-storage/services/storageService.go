package services

import (
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"object-storage/config"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

// SaveFile menyimpan file yang diunggah ke storage
// SaveFile menyimpan file dan menyisipkan log ke log_object_storage

var allowedExtensions = map[string]bool{
	".txt":  true, // File teks biasa
	".doc":  true, // Microsoft Word Document (versi lama)
	".docx": true, // Microsoft Word Open XML Document (versi baru)
	".odt":  true, // OpenDocument Text Document
	".rtf":  true, // Rich Text Format
	".md":   true, // Markdown File
	".csv":  true, // Comma-Separated Values
	".xls":  true, // Microsoft Excel Spreadsheet (versi lama)
	".xlsx": true, // Microsoft Excel Open XML Spreadsheet (versi baru)
	".ppt":  true, // Microsoft PowerPoint Presentation (versi lama)
	".pptx": true, // Microsoft PowerPoint Open XML Presentation (versi baru)
	".pdf":  true, // Portable Document Format
	".html": true, // HyperText Markup Language
	".htm":  true, // HyperText Markup Language (versi pendek)
	".json": true, // JavaScript Object Notation
	".xml":  true, // Extensible Markup Language
	".yaml": true, // YAML Ain't Markup Language
	".yml":  true, // YAML Ain't Markup Language (versi pendek)
	".zip":  true, // ZIP Archive
	".tar":  true, // Tarball Archive
	".gz":   true, // Gzip Compressed File
	".7z":   true, // 7-Zip Archive
	".jpg":  true, // JPEG Image
	".jpeg": true, // JPEG Image
	".png":  true, // Portable Network Graphics
	".gif":  true, // Graphics Interchange Format
	".bmp":  true, // Bitmap Image
	".tiff": true, // Tagged Image File Format
	".svg":  true, // Scalable Vector Graphics
}

func SaveFile(file *multipart.FileHeader, relativePath string, name, bucket, isPublic string) (string, error) {
	// Membuka file untuk dibaca
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Validasi ekstensi file
	ext := filepath.Ext(file.Filename)
	if !allowedExtensions[ext] {
		return "", fmt.Errorf("file extension %s is not allowed", ext)
	}

	random := uuid.New().String()
	filename := fmt.Sprintf("%s%s", random, ext)

	// Menentukan path untuk menyimpan file
	dstPath := filepath.Join(relativePath, filename)
	os.MkdirAll(filepath.Dir(dstPath), os.ModePerm) // Membuat direktori jika belum ada

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Menyalin konten file ke lokasi penyimpanan
	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	// Menghasilkan nama file acak
	// Menghasilkan angka acak dan menggabungkannya dengan string

	size := file.Size
	path := dstPath

	query := `
        INSERT INTO log_object_storage (filename, size, path, ext, name, bucket, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err = config.DB.Exec(query, filename, size, path, ext, name, bucket, isPublic)
	if err != nil {
		return "", err
	}
	return filename, nil
}

// GetFile mengambil path file dari storage
func CheckFileVisibility(filename string) (*string, error) {
	var isPublic *string
	query := "SELECT is_public FROM log_object_storage WHERE filename = $1"
	err := config.DB.QueryRow(query, filename).Scan(&isPublic)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // File tidak ditemukan
		}
		return nil, err
	}

	return isPublic, nil
}

func VerifySecret(secret string) (bool, error) {
	var exists bool
	query := "SELECT EXISTS (SELECT 1 FROM setup_object_storage WHERE secret = $1)"
	err := config.DB.QueryRow(query, secret).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func AccessKeyGenerator(filename string) (string, error) {
	// Generate a unique access key
	accessKey := uuid.New().String()

	// Insert the access key into the generated_files table
	query := `
        INSERT INTO generated_files (access_key, filename, created_at, attempt)
        VALUES ($1, $2, $3, $4)
    `

	_, err := config.DB.Exec(query, accessKey, filename, time.Now(), "0")
	if err != nil {
		return "", fmt.Errorf("failed to insert access key: %v", err)
	}

	return accessKey, nil
}
