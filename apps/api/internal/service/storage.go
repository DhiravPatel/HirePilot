package service

import (
	"context"

	"github.com/yourusername/hirepilot/api/pkg/appwrite"
)

type StorageService struct {
	client *appwrite.Client
}

func NewStorageService(client *appwrite.Client) *StorageService {
	return &StorageService{client: client}
}

func (s *StorageService) Upload(ctx context.Context, fileID, filename string, content []byte, mimeType string) (*appwrite.UploadedFile, error) {
	return s.client.UploadFile(ctx, fileID, filename, content, mimeType)
}

func (s *StorageService) Delete(ctx context.Context, fileID string) error {
	return s.client.DeleteFile(ctx, fileID)
}

func (s *StorageService) GetURL(fileID string) string {
	return s.client.GetFileURL(fileID)
}

func (s *StorageService) Download(ctx context.Context, fileID string) ([]byte, error) {
	return s.client.DownloadFile(ctx, fileID)
}
