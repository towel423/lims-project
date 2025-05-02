package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

// DatabaseConfig adalah struktur untuk menampung konfigurasi database
type DatabaseConfig struct {
	User     string
	Password string
	DBName   string
	Host     string
	Port     int
	SSLMode  string
}

// GetDatabaseConfig mengembalikan konfigurasi database
func GetDatabaseConfig() *DatabaseConfig {
	portStr := os.Getenv("DB_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Fatalf("Invalid DB_PORT value: %s", portStr)
	}

	return &DatabaseConfig{
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		Host:     os.Getenv("DB_HOST"),
		Port:     port,
		SSLMode:  "disable",
	}
}

// GetDatabaseConnectionString mengembalikan string koneksi database
func GetDatabaseConnectionString(config *DatabaseConfig) string {
	return fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%d sslmode=%s",
		config.User, config.Password, config.DBName, config.Host, config.Port, config.SSLMode)
}

// InitDatabase menginisialisasi koneksi database
func InitDatabase() error {
	config := GetDatabaseConfig()
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%d sslmode=%s",
		config.User, config.Password, config.DBName, config.Host, config.Port, config.SSLMode)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	err = DB.Ping()
	if err != nil {
		return err
	}

	fmt.Println("Successfully connected to the database!")
	return nil
}

var DB *sql.DB
