package utils

import (
	"time"
)

// StringPtr returns a pointer to the string value.
func StringPtr(s string) *string {
	return &s
}

// IntPtr returns a pointer to the int value.
func IntPtr(i int) *int {
	return &i
}

// BoolPtr returns a pointer to the bool value.
func BoolPtr(b bool) *bool {
	return &b
}

// TimePtr returns a pointer to the time.Time value.
func TimePtr(t time.Time) *time.Time {
	return &t
}
