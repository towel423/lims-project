package helpers

import (
	"github.com/gofiber/fiber/v2"
)

// ResponseFormat adalah struktur untuk format respons JSON
type ResponseFormat struct {
	Data       interface{} `json:"data"`
	Message    string      `json:"message"`
	StatusCode int         `json:"statusCode"`
}

// SendResponse mengirimkan respons JSON dengan format yang konsisten
func SendResponse(c *fiber.Ctx, data interface{}, message string, statusCode int) error {
	response := ResponseFormat{
		Data:       data,
		Message:    message,
		StatusCode: statusCode,
	}
	return c.Status(statusCode).JSON(response)
}
