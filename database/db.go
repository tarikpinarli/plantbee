package main

import (
	"fmt"
	// "errors"
	"log"
	"context" //timeouts, cancellations, and request lifecycles.

	"os" //Package os provides a platform-independent interface to operating system functionalit

	"github.com/jackc/pgx/v5/pgxpool" //PostgreSQL driver and connection pool for Go.

)

/**
A connection pool reuses existing connection, instead of opening a new connection for every query
DB is the shared connection pool your whole app will use
*/

// declare global variable
var DB *pgxpool.Pool

func Init() error {
    databaseURL := os.Getenv("DATABASE_URL")
    if databaseURL == "" {
        return fmt.Errorf("DATABASE_URL environment variable is not set")
    }

    var err error
    DB, err = pgxpool.New(context.Background(), databaseURL)
    if err != nil {
        return fmt.Errorf("unable to create connection pool: %w", err)
    }

    // Verify the connection is actually working
    if err = DB.Ping(context.Background()); err != nil {
        return fmt.Errorf("unable to connect to database: %w", err)
    }

    fmt.Println("✅ Connected to PostgreSQL")
    return nil
}

// func Hellomsg(name string) (string, error) {
// 	if name =="" {
// 		return "", errors.New("empty name")
// 	}

// 	message := fmt.Sprintf("Hello, %v", name)
// 	return message, nil
// }

func main() {
	err := Init()
	if err != nil {
		log.Fatal(err) // log package Fatal function to print error and stop prg
	}
	
	fmt.Println(err)

	
}