package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DocumentRelated represents the model for the document_related table
type DocumentRelated struct {
	ID                int        `gorm:"primaryKey;autoIncrement" json:"id"`
	UUID              uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4()" json:"uuid"`
	DocumentID        *int       `gorm:"type:int" json:"document_id"`
	DocumentIDRelated *int       `gorm:"type:int" json:"document_id_related"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         *time.Time `gorm:"index" json:"deleted_at"` // for soft delete support
}

// TableName overrides the default table name
func (DocumentRelated) TableName() string {
	return "document_related"
}

// BeforeCreate is a GORM hook that sets a UUID before inserting a new record
func (d *DocumentRelated) BeforeCreate(tx *gorm.DB) (err error) {
	d.UUID = uuid.New()
	return
}
