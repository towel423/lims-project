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

type AdminTeamController struct {
	Service *services.AdminTeamService
}

func NewAdminTeamController() *AdminTeamController {
	return &AdminTeamController{
		Service: services.NewAdminTeamService(),
	}
}

func (c *AdminTeamController) GetTeams(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	enforcer := helpers.GetCasbinEnforcer()
	hasAccess, err := enforcer.Enforce(username, "team", "read", "none", "none", "none")
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

	result, err := c.Service.GetTeamsPaginated(currentPage, pageSize, search)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Failed to fetch teams",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       result,
	})
}

func (c *AdminTeamController) CreateTeam(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	enforcer := helpers.GetCasbinEnforcer()
	hasAccess, err := enforcer.Enforce(username, "team", "create", "none", "none", "none")
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

	var team models.Team
	if err := ctx.BodyParser(&team); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Ambil file Photo dari form jika ada
	photo, err := ctx.FormFile("photo")
	if err != nil {
		// Jika error selain karena file tidak ada
		if err.Error() != "http: no such file" {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"statusCode": fiber.StatusBadRequest,
				"message":    "Failed to read photo file",
			})
		}
		// Jika file tidak ada, set photo sebagai nil
		photo = nil
	}

	if err := c.Service.AddTeam(&team, photo); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Could not create team",
			"data":       nil,
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"statusCode": fiber.StatusCreated,
		"message":    "Team created successfully",
		"data":       team,
	})
}

func (c *AdminTeamController) GetTeamByUUID(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	enforcer := helpers.GetCasbinEnforcer()
	hasAccess, err := enforcer.Enforce(username, "team", "read", "none", "none", "none")
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

	uuidStr := ctx.Params("uuid")
	if uuidStr == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "UUID is required",
			"data":       nil,
		})
	}

	uuid, err := uuid.Parse(uuidStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    "Invalid UUID format",
			"data":       nil,
		})
	}

	team, err := c.Service.GetTeamByUUID(uuid.String())
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"statusCode": fiber.StatusNotFound,
			"message":    "Team not found",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Success",
		"data":       team,
	})
}

func (c *AdminTeamController) UpdateTeam(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	enforcer := helpers.GetCasbinEnforcer()
	hasAccess, err := enforcer.Enforce(username, "team", "update", "none", "none", "none")
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

	uuidStr := ctx.Params("uuid")

	var updatedTeam models.Team
	if err := ctx.BodyParser(&updatedTeam); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"statusCode": fiber.StatusBadRequest,
			"message":    err.Error(),
			"data":       nil,
		})
	}

	// Ambil file Photo dari form jika ada
	photo, err := ctx.FormFile("photo")
	if err != nil {
		// Jika error selain karena file tidak ada
		if err.Error() != "http: no such file" {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"statusCode": fiber.StatusBadRequest,
				"message":    "Failed to read photo file",
			})
		}
		// Jika file tidak ada, set photo sebagai nil
		photo = nil
	}

	updatedTeamData, err := c.Service.UpdateTeamByUUID(uuidStr, &updatedTeam, photo)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    fmt.Sprintf("Could not update team: %v", err),
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusOK,
		"message":    "Team updated successfully",
		"data":       updatedTeamData,
	})
}

func (c *AdminTeamController) DeleteTeam(ctx *fiber.Ctx) error {
	username := ctx.Locals("username").(string)

	enforcer := helpers.GetCasbinEnforcer()
	hasAccess, err := enforcer.Enforce(username, "team", "delete", "none", "none", "none")
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

	uuidStr := ctx.Params("uuid")

	if err := c.Service.DeleteTeam(uuidStr); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"statusCode": fiber.StatusInternalServerError,
			"message":    "Could not delete team",
			"data":       nil,
		})
	}

	return ctx.JSON(fiber.Map{
		"statusCode": fiber.StatusNoContent,
		"message":    "Team deleted successfully",
		"data":       nil,
	})
}
