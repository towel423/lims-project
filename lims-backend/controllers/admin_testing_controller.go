package controllers

import (
	"backend-school/helpers"
	"backend-school/services"

	"github.com/gofiber/fiber/v2"
)

type TestingDocumentController struct {
	Service *services.CategoryDocumentService
}

func NewTestingDocumentController() *TestingDocumentController {
	return &TestingDocumentController{
		Service: services.NewCategoryDocumentService(),
	}
}

// GetCategoryDocuments retrieves a paginated list of category documents.
func (c *TestingDocumentController) TestCasbin(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)
	// Parse pagination and search query parameters
	policy := ctx.Query("policy")
	action := ctx.Query("action")
	category := ctx.Query("category")
	type_c := ctx.Query("type_c")
	docid := ctx.Query("docid")

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "category-document" resource using the "read" action
	hasAccess, err := enforcer.Enforce(username, policy, action, category, type_c, docid)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Casbin Running Well",
	})
}
