package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DocumentLog struct {
	ID                int        `json:"id" gorm:"primaryKey;autoIncrement"`
	UUID              uuid.UUID  `json:"uuid" gorm:"type:uuid;default:uuid_generate_v4()"`
	DocumentVersionID *int       `json:"document_version_id" gorm:"column:document_version_id"`
	StatusDocumentID  *int       `json:"status_document_id" gorm:"column:status_document_id"`
	Date              time.Time  `gorm:"type:date" json:"publish_date"`
	CreatedBy         *int       `gorm:"type:int" json:"created_by"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at" gorm:"column:deleted_at"`
	Note              *string    `json:"note" gorm:"column:note"`
}

// TableName overrides the default table name for the DocumentLog model
func (DocumentLog) TableName() string {
	return "document_log"
}

// BeforeCreate is a GORM hook that sets a UUID before inserting a new record
func (d *DocumentLog) BeforeCreate(tx *gorm.DB) (err error) {
	d.UUID = uuid.New()
	return
}
