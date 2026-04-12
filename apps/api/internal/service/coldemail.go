package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/pkg/groq"
)

type ColdEmailResult struct {
	ExtractedInfo struct {
		CompanyName     string   `json:"companyName"`
		JobTitle        string   `json:"jobTitle"`
		KeyRequirements []string `json:"keyRequirements"`
	} `json:"extractedInfo"`
	Subject          string   `json:"subject"`
	Body             string   `json:"body"`
	FollowUp1        string   `json:"followUp1"`
	FollowUp2        string   `json:"followUp2"`
	UsedProfileFields []string `json:"usedProfileFields"`
	HighlightedSkills []string `json:"highlightedSkills"`
}

type ColdEmailService struct {
	groqClient *groq.Client
}

func NewColdEmailService(groqClient *groq.Client) *ColdEmailService {
	return &ColdEmailService{groqClient: groqClient}
}

const coldEmailSystemPrompt = `You are a world-class career coach and copywriter who specializes in writing cold outreach emails for job seekers. You have helped thousands of candidates land interviews at top companies including FAANG, startups, and Fortune 500 companies.

Your emails are:
- Personalized and specific to the company/role (never generic)
- Concise, confident, and compelling
- Free of clichés like "I hope this email finds you well" or "I am writing to express my interest"
- Structured to get a response within the first 3 lines
- Professional but human — they sound like a real person, not a bot

You always return a valid JSON object, nothing else.`

func (s *ColdEmailService) Generate(ctx context.Context, user db.User, jobPosting, recruiterName, recruiterEmail, companyName string) (*ColdEmailResult, error) {
	userName := "Not specified"
	if user.Name != nil {
		userName = *user.Name
	}
	currentRole := "Not specified"
	if user.CurrentRole != nil {
		currentRole = *user.CurrentRole
	}
	targetRole := "Not specified"
	if user.TargetRole != nil {
		targetRole = *user.TargetRole
	}
	yearsExp := "Not specified"
	if user.YearsOfExperience != nil {
		yearsExp = fmt.Sprintf("%d", *user.YearsOfExperience)
	}
	skills := "Not specified"
	if len(user.Skills) > 0 {
		limit := len(user.Skills)
		if limit > 8 {
			limit = 8
		}
		skills = strings.Join(user.Skills[:limit], ", ")
	}
	bio := "Not provided"
	if user.Bio != nil {
		bio = *user.Bio
	}
	linkedinURL := "Not provided"
	if user.LinkedinURL != nil {
		linkedinURL = *user.LinkedinURL
	}

	if strings.TrimSpace(recruiterName) == "" {
		recruiterName = "Unknown — address generically as Hiring Manager"
	}
	if strings.TrimSpace(recruiterEmail) == "" {
		recruiterEmail = "Not provided"
	}
	if strings.TrimSpace(companyName) == "" {
		companyName = "Extract from job posting"
	}

	userPrompt := fmt.Sprintf(`Write a personalized cold email for a job application using the following information.

CANDIDATE PROFILE:
- Name: %s
- Current Role: %s
- Target Role: %s
- Years of Experience: %s
- Top Skills: %s
- Bio: %s
- LinkedIn: %s

EMAIL PREFERENCES:
- Tone: %s (PROFESSIONAL=formal yet warm, FRIENDLY=casual and approachable, BOLD=direct and confident, HUMBLE=grateful and eager)
- Style: %s (CONCISE=3-4 sentences body, DETAILED=full 2 paragraph body, STORYTELLING=opens with a compelling narrative hook)

JOB POSTING:
%s

RECRUITER INFO (if known):
- Name: %s
- Email: %s
- Company: %s

INSTRUCTIONS:
1. Extract the company name, job title, and 3-5 key requirements from the job posting
2. Write the main email matching the tone and style
3. Write a Day 5 follow-up email (brief, 2-3 sentences)
4. Write a Day 10 follow-up email (brief, 2-3 sentences, slightly different angle)
5. The subject line should be specific, personalized, and under 60 characters

Return ONLY a valid JSON object:
{
  "extractedInfo": {
    "companyName": "<extracted company name>",
    "jobTitle": "<extracted job title>",
    "keyRequirements": ["<req 1>", "<req 2>", "<req 3>"]
  },
  "subject": "<email subject line>",
  "body": "<full email body — use \n for line breaks>",
  "followUp1": "<day 5 follow-up email body>",
  "followUp2": "<day 10 follow-up email body>",
  "usedProfileFields": ["<field 1>", "<field 2>"],
  "highlightedSkills": ["<skill from user profile that was mentioned in email>"]
}`,
		userName, currentRole, targetRole, yearsExp, skills, bio, linkedinURL,
		user.EmailTone, user.EmailStyle,
		jobPosting,
		recruiterName, recruiterEmail, companyName,
	)

	result, err := groq.CompleteJSON[ColdEmailResult](ctx, s.groqClient, coldEmailSystemPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("cold email generation failed: %w", err)
	}

	return &result, nil
}
