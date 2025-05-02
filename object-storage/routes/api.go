package routes

import (
	"object-storage/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	app.Post("/upload", controllers.UploadFile)
	app.Post("/files/:filename", controllers.GetFile)
	app.Get("/generated-files/:filename", controllers.OpenFile)
}
