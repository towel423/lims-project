package helpers

import (
	"fmt"

	"object-storage/config"

	"github.com/gofiber/fiber/v2"
)

// Permission memeriksa apakah kombinasi nama dan secret ada di database.
func Permission(c *fiber.Ctx) (bool, error) {
	name := c.FormValue("name")
	secret := c.FormValue("secret")
	var exists bool

	query := "SELECT EXISTS (SELECT 1 FROM setup_object_storage WHERE name = $1 AND secret = $2)"

	err := config.DB.QueryRow(query, name, secret).Scan(&exists)
	if err != nil {
		fmt.Println("Error:", err)
		return false, err
	}

	return exists, nil
}
