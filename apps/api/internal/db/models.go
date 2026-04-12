package db

import (
	"time"
)

type User struct {
	ID                string   `json:"id"`
	Email             string   `json:"email"`
	Name              *string  `json:"name"`
	Image             *string  `json:"image"`
	GoogleID          *string  `json:"googleId"`
	OnboardingDone    bool     `json:"onboardingDone"`
	Headline          *string  `json:"headline"`
	CurrentRole       *string  `json:"currentRole"`
	TargetRole        *string  `json:"targetRole"`
	YearsOfExperience *int32   `json:"yearsOfExperience"`
	Skills            []string `json:"skills"`
	LinkedinURL       *string  `json:"linkedinUrl"`
	GithubURL         *string  `json:"githubUrl"`
	PortfolioURL      *string  `json:"portfolioUrl"`
	Phone             *string  `json:"phone"`
	Location          *string  `json:"location"`
	Bio               *string  `json:"bio"`
	EmailTone         string   `json:"emailTone"`
	EmailStyle        string   `json:"emailStyle"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type Resume struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	Name         string    `json:"name"`
	FileID       string    `json:"fileId"`
	FileURL      string    `json:"fileUrl"`
	OriginalName string    `json:"originalName"`
	FileSize     int32     `json:"fileSize"`
	MimeType     string    `json:"mimeType"`
	IsDefault    bool      `json:"isDefault"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type ColdEmail struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	JobPosting     string    `json:"jobPosting"`
	RecruiterName  *string   `json:"recruiterName"`
	RecruiterEmail *string   `json:"recruiterEmail"`
	CompanyName    *string   `json:"companyName"`
	JobTitle       *string   `json:"jobTitle"`
	Subject        string    `json:"subject"`
	Body           string    `json:"body"`
	FollowUp1      *string   `json:"followUp1"`
	FollowUp2      *string   `json:"followUp2"`
	Tone           string    `json:"tone"`
	Style          string    `json:"style"`
	IsSaved        bool      `json:"isSaved"`
	Label          *string   `json:"label"`
	CreatedAt      time.Time `json:"createdAt"`
}
