package appwrite

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type Client struct {
	endpoint  string
	projectID string
	apiKey    string
	bucketID  string
	http      *http.Client
}

func NewClient(endpoint, projectID, apiKey, bucketID string) *Client {
	return &Client{
		endpoint:  endpoint,
		projectID: projectID,
		apiKey:    apiKey,
		bucketID:  bucketID,
		http:      &http.Client{Timeout: 30 * time.Second},
	}
}

type UploadedFile struct {
	ID   string `json:"$id"`
	Name string `json:"name"`
	Size int    `json:"sizeOriginal"`
}

func (c *Client) UploadFile(ctx context.Context, fileID, filename string, content []byte, mimeType string) (*UploadedFile, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	_ = writer.WriteField("fileId", fileID)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}
	if _, err = io.Copy(part, bytes.NewReader(content)); err != nil {
		return nil, err
	}
	writer.Close()

	url := fmt.Sprintf("%s/storage/buckets/%s/files", c.endpoint, c.bucketID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Appwrite-Project", c.projectID)
	req.Header.Set("X-Appwrite-Key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("appwrite upload failed: %s", string(b))
	}

	var file UploadedFile
	if err := json.NewDecoder(resp.Body).Decode(&file); err != nil {
		return nil, err
	}
	return &file, nil
}

func (c *Client) DeleteFile(ctx context.Context, fileID string) error {
	url := fmt.Sprintf("%s/storage/buckets/%s/files/%s", c.endpoint, c.bucketID, fileID)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("X-Appwrite-Project", c.projectID)
	req.Header.Set("X-Appwrite-Key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("appwrite delete failed: %s", string(b))
	}
	return nil
}

func (c *Client) GetFileURL(fileID string) string {
	return fmt.Sprintf("%s/storage/buckets/%s/files/%s/view?project=%s",
		c.endpoint, c.bucketID, fileID, c.projectID)
}

func (c *Client) DownloadFile(ctx context.Context, fileID string) ([]byte, error) {
	url := fmt.Sprintf("%s/storage/buckets/%s/files/%s/download?project=%s",
		c.endpoint, c.bucketID, fileID, c.projectID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Appwrite-Key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}
