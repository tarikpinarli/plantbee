package main

import (
	"fmt" //print output
	"log" //print errors and stop program
	"gorm.io/driver/postgres" //progres driver for gorm
	"gorm.io/gorm" // ORM engine
	// "plant_data/database"
)

type Student struct {
	gorm.Model	// adds ID, createdat, updatedat, deletedat
	// ID			uint		`gorm:"primaryKey"`
	FullName	string		`gorm:"not null"`
	Email		string		`gorm:"unique;not null"`
}

func main() {
	// db.Setup()

	// database connection string
	dsn := "host=localhost user=postgres password=postgrespw dbname=  port=5432 sslmode=disable"

	// open database connection
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Connected to database!")

	// check the struct Student and make sure the table exist in database
	err = db.AutoMigrate(&Student{})
	if err != nil {
		log.Fatal("Migration failed:", err)
	} 

	fmt.Println("Migration complete!")

	// insert data
	students := Student{
		FullName:	"Trang Pham",
		Email:		"hatrangc2@gmail.com",
	}

	db.Create(&students)

	fmt.Println("Inserted student!")

	// query data and store in result
	var result Student
	db.First(&result, "email = ?", "hatrangc2@gmail.com")

	fmt.Println("Retrieved student:", result.FullName)

}