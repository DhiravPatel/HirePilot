package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/yourusername/hirepilot/api/pkg/groq"
)

type ATSResult struct {
	OverallScore     int      `json:"overallScore"`
	FormattingScore  int      `json:"formattingScore"`
	KeywordsScore    int      `json:"keywordsScore"`
	ExperienceScore  int      `json:"experienceScore"`
	EducationScore   int      `json:"educationScore"`
	SkillsScore      int      `json:"skillsScore"`
	ReadabilityScore int      `json:"readabilityScore"`
	Strengths        []string `json:"strengths"`
	Weaknesses       []string `json:"weaknesses"`
	Suggestions      []string `json:"suggestions"`
	MissingKeywords  []string `json:"missingKeywords"`
	MatchedKeywords  []string `json:"matchedKeywords"`
	ScoreSummary     string   `json:"scoreSummary"`
	TopPriority      string   `json:"topPriority"`
}

type ATSService struct {
	groqClient *groq.Client
}

func NewATSService(groqClient *groq.Client) *ATSService {
	return &ATSService{groqClient: groqClient}
}

const atsSystemPrompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach with 15+ years of experience in technical recruiting. You specialize in analyzing resumes for ATS compatibility, keyword optimization, and human readability.

Your job is to analyze the provided resume text and return a detailed, structured JSON evaluation. Be brutally honest but constructive. Your analysis must be actionable — every weakness must have a corresponding suggestion.

RULES:
- Always return valid JSON, nothing else
- Scores are integers from 0 to 100
- Arrays must have at least 3 items where required
- Missing keywords should be specific technical skills, tools, certifications, or role-specific phrases
- Suggestions must be specific (not generic) and immediately actionable
- Consider the target job description heavily if provided
- If no job description is provided, analyze for general ATS compatibility for the apparent target role`

func (s *ATSService) ScanResume(ctx context.Context, resumeText, jobTitle, jobDescription string) (*ATSResult, string, error) {
	if strings.TrimSpace(jobTitle) == "" {
		jobTitle = "Not specified — infer from resume"
	}
	if strings.TrimSpace(jobDescription) == "" {
		jobDescription = "Not provided — perform general ATS analysis"
	}

	userPrompt := fmt.Sprintf(`Analyze this resume for ATS compatibility.

RESUME TEXT:
%s

TARGET JOB TITLE: %s

JOB DESCRIPTION:
%s

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <0-100>,
  "formattingScore": <0-100>,
  "keywordsScore": <0-100>,
  "experienceScore": <0-100>,
  "educationScore": <0-100>,
  "skillsScore": <0-100>,
  "readabilityScore": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": [
    "<specific actionable suggestion 1>",
    "<specific actionable suggestion 2>",
    "<specific actionable suggestion 3>",
    "<specific actionable suggestion 4>",
    "<specific actionable suggestion 5>"
  ],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "...up to 15"],
  "matchedKeywords": ["<keyword 1>", "<keyword 2>", "...up to 15"],
  "scoreSummary": "<2-3 sentence plain English summary of the overall assessment>",
  "topPriority": "<The single most important thing this person should fix right now>"
}`, resumeText, jobTitle, jobDescription)

	result, err := groq.CompleteJSON[ATSResult](ctx, s.groqClient, atsSystemPrompt, userPrompt)
	if err != nil {
		return nil, "", fmt.Errorf("ats scan failed: %w", err)
	}

	rawFeedback := fmt.Sprintf("Score Summary: %s\nTop Priority: %s", result.ScoreSummary, result.TopPriority)

	return &result, rawFeedback, nil
}
