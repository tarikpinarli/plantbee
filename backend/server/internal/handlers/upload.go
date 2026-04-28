package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (h *Handler) HandleUploadImage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Invalid file", http.StatusBadRequest)
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			fmt.Printf("error closing file: %v\n", err)
		}
	}()

	randBytes := make([]byte, 8)
	if _, err := rand.Read(randBytes); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	filename := hex.EncodeToString(randBytes) + "_" + handler.Filename

	var url string
	if h.S3Client != nil {
		key := "uploads/" + filename
		_, err = h.S3Client.PutObject(context.Background(), &s3.PutObjectInput{
			Bucket:      &h.Cfg.S3BucketName,
			Key:         &key,
			Body:        file,
			ContentType: strPtr(handler.Header.Get("Content-Type")),
		})
		if err != nil {
			http.Error(w, "Failed to upload", http.StatusInternalServerError)
			return
		}
		url = "/uploads/" + filename
	} else {
		if err := os.MkdirAll(h.Cfg.UploadDir, os.ModePerm); err != nil {
			http.Error(w, "Failed to create folder", http.StatusInternalServerError)
			return
		}
		dstPath := filepath.Join(h.Cfg.UploadDir, filename)
		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}
		defer func() {
			if err := dst.Close(); err != nil {
				fmt.Printf("error closing dst file: %v\n", err)
			}
		}()
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Failed to write file", http.StatusInternalServerError)
			return
		}
		url = "/uploads/" + filename
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{"url": url}); err != nil {
		fmt.Printf("error encoding json response: %v\n", err)
	}
}

func strPtr(s string) *string { return &s }
