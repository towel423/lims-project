package controllers

import (
	"backend-school/helpers"
	"backend-school/models"
	"backend-school/services"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AdminPersonController struct {
	Service *services.AdminPersonService
}

func NewAdminPersonController() *AdminPersonController {
	return &AdminPersonController{
		Service: services.NewAdminPersonService(),
	}
}

func (c *AdminPersonController) GetPersons(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "person", "read", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	pageStr := ctx.Query("currentPage", "1")
	pageSizeStr := ctx.Query("pageSize", "10")
	search := ctx.Query("search", "")

	currentPage, err := strconv.Atoi(pageStr)
	if err != nil || currentPage < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid currentPage",
			"data":       nil,
		})
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid pageSize",
			"data":       nil,
		})
	}

	result, err := c.Service.GetPersonsPaginated(currentPage, pageSize, search)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch persons",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

func (c *AdminPersonController) CreatePerson(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "person", "create", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	var person models.Person

	// Parsing body dari JSON
	if err := ctx.BodyParser(&person); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Parsing nilai active jika menggunakan form data
	activeStr := ctx.FormValue("active")
	if activeStr != "" {
		active, err := strconv.Atoi(activeStr)
		if err == nil {
			person.Active = (active == 1) // Konversi 1 menjadi true dan 0 menjadi false
		}
	}

	if err := c.Service.AddPerson(&person, nil); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Could not create person",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"message":    "Person created successfully",
		"data":       person,
	})
}

func (c *AdminPersonController) GetPersonByUUID(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "person", "read", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	uuidStr := ctx.Params("uuid")
	if uuidStr == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "UUID is required",
			"data":       nil,
		})
	}

	// Debugging UUID
	fmt.Println("Received UUID:", uuidStr)

	uuid, err := uuid.Parse(uuidStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid UUID format",
			"data":       nil,
		})
	}

	person, err := c.Service.GetPersonByUUID(uuid.String())
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Person not found",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       person,
	})
}

func (c *AdminPersonController) UpdatePerson(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "person", "update", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	// Ambil UUID dari parameter URL
	uuidStr := ctx.Params("uuid")

	// Deklarasi variabel untuk menyimpan data yang di-update
	var updatedPerson models.Person

	// Parsing body untuk mendapatkan data person yang akan diupdate
	if err := ctx.BodyParser(&updatedPerson); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Mengambil nilai active dari form data
	activeStr := ctx.FormValue("active")
	if activeStr != "" {
		activeValue, err := strconv.Atoi(activeStr)
		if err != nil || (activeValue != 0 && activeValue != 1) {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"statusCode": fiber.StatusBadRequest,
				"message":    "Invalid value for active field. Must be 0 or 1.",
				"data":       nil,
			})
		}
		// Konversi 0 menjadi false dan 1 menjadi true
		updatedPerson.Active = (activeValue == 1)
		fmt.Printf("Updated active value: %v\n", updatedPerson.Active) // Debug: Print nilai active yang telah dikonversi
	}

	// Mengambil file image (opsional)
	file, _ := ctx.FormFile("image")

	// Update person melalui service
	updatedPersonData, err := c.Service.UpdatePersonByUUID(uuidStr, &updatedPerson, file)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Could not update person: %v", err),
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Person updated successfully",
		"data":       updatedPersonData,
	})
}

func (c *AdminPersonController) DeletePerson(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string) // Use ctx.Locals instead of c.Locals

	// Get the Casbin enforcer
	enforcer := helpers.GetCasbinEnforcer()

	// Check if the user has access to the "/admin" resource using the "GET" action
	hasAccess, err := enforcer.Enforce(username, "person", "delete", "none", "none", "none")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to check access.",
		})
	}

	if !hasAccess {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{ // Use ctx.Status
			"statusCode": fiber.StatusForbidden,
			"message":    "Forbidden: You don't have access to this resource",
		})
	}
	uuidStr := ctx.Params("uuid")

	if err := c.Service.DeletePerson(uuidStr); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Could not delete person",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusNoContent,
		"message":    "Person deleted successfully",
		"data":       nil,
	})
}
