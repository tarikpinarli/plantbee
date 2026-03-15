package storage

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// This struct holds database
type DB struct {
	*sql.DB
}

// connect the databas
func New(connStr string) (*DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("❌ Could not open db connection: %v", err)
	}

	// Test the connection (ping)
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("❌ Could not ping db: %v", err)
	}

	return &DB{db}, nil
}
