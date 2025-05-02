package controllers

import (
	"backend-school/config"
	"backend-school/services"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type BannerController struct {
	BannerService *services.PublicBannerService
}

func NewBannerController() *BannerController {
	// Ensure MinioClient and bucketName are properly initialized
	minioClient := config.MinioClient       // Ensure this is the correct Minio client initialization
	bucketName := os.Getenv("MINIO_BUCKET") // Ensure the environment variable is set
	minioService := services.NewMinioService(minioClient)

	// Initialize BannerService with the required arguments
	bannerService := services.NewBannerService(minioClient, bucketName, minioService)

	return &BannerController{BannerService: bannerService}
}

func (c *BannerController) GetBanners(ctx *fiber.Ctx) error {
	pageStr := ctx.Query("currentPage", "1")
	pageSizeStr := ctx.Query("pageSize", "10")
	search := ctx.Query("search", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil || currentPage < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid currentPage"})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pageSize"})
	}

	result, err := c.BannerService.GetBanners(currentPage, pageSize, search)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch banners"})
	}

	return ctx.JSON(result)
}
