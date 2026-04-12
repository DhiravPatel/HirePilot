package service

import (
	"fmt"

	pdfpkg "github.com/yourusername/hirepilot/api/pkg/pdf"
)

type ResumeService struct{}

func NewResumeService() *ResumeService {
	return &ResumeService{}
}

func (s *ResumeService) ExtractText(content []byte) (string, error) {
	text, err := pdfpkg.ExtractText(content)
	if err != nil {
		return "", fmt.Errorf("resume text extraction failed: %w", err)
	}
	return text, nil
}
