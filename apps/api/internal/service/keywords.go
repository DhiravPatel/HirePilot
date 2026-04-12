package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/yourusername/hirepilot/api/pkg/groq"
)

type Keyword struct {
	Keyword    string `json:"keyword"`
	Category   string `json:"category"`
	Importance int    `json:"importance"`
	Tip        string `json:"tip"`
}

type KeywordOptimizeResult struct {
	TargetRole string    `json:"targetRole"`
	Keywords   []Keyword `json:"keywords"`
	Summary    string    `json:"summary"`
}

type KeywordCheckResult struct {
	MatchedKeywords []string `json:"matchedKeywords"`
	MissingKeywords []string `json:"missingKeywords"`
	MatchPercentage int      `json:"matchPercentage"`
	Suggestions     []string `json:"suggestions"`
}

type KeywordService struct {
	groqClient *groq.Client
}

func NewKeywordService(groqClient *groq.Client) *KeywordService {
	return &KeywordService{groqClient: groqClient}
}

const keywordOptimizeSystemPrompt = `You are an expert technical recruiter and resume strategist. You know exactly what keywords, tools, frameworks, certifications, and action verbs ATS systems and human recruiters look for when hiring for any given role.
You always return valid JSON, nothing else.`

func (s *KeywordService) Optimize(ctx context.Context, targetRole, industry, experienceLevel string) (*KeywordOptimizeResult, error) {
	if strings.TrimSpace(industry) == "" {
		industry = "Technology — infer if not specified"
	}
	if strings.TrimSpace(experienceLevel) == "" {
		experienceLevel = "Mid-level"
	}

	userPrompt := fmt.Sprintf(`Generate a comprehensive list of ATS keywords and phrases for the following target role.

TARGET ROLE: %s
INDUSTRY: %s
EXPERIENCE LEVEL: %s

Return ONLY a valid JSON object:
{
  "targetRole": "<normalized role title>",
  "keywords": [
    {
      "keyword": "<keyword or phrase>",
      "category": "<Technical Skills | Soft Skills | Tools | Certifications | Action Verbs | Industry Terms>",
      "importance": <1-10>,
      "tip": "<one sentence on how to naturally incorporate this in a resume>"
    }
  ],
  "summary": "<2 sentence overview of what recruiters look for in this role>"
}

Include 25-35 keywords. Prioritize by importance score descending.`, targetRole, industry, experienceLevel)

	result, err := groq.CompleteJSON[KeywordOptimizeResult](ctx, s.groqClient, keywordOptimizeSystemPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("keyword optimization failed: %w", err)
	}
	return &result, nil
}

const keywordCheckSystemPrompt = `You are an expert ATS keyword analyzer. You cross-reference resume content against target keywords to identify matches and gaps. You always return valid JSON, nothing else.`

func (s *KeywordService) Check(ctx context.Context, resumeText string, targetKeywords []string) (*KeywordCheckResult, error) {
	userPrompt := fmt.Sprintf(`Cross-reference the following resume text against the target keywords list.

RESUME TEXT:
%s

TARGET KEYWORDS:
%s

Analyze which keywords are present (exact or semantic match) and which are missing.

Return ONLY a valid JSON object:
{
  "matchedKeywords": ["<keyword that appears in resume>"],
  "missingKeywords": ["<keyword not found in resume>"],
  "matchPercentage": <0-100>,
  "suggestions": [
    "<specific suggestion on how to add a missing keyword naturally>",
    "<another suggestion>"
  ]
}`, resumeText, strings.Join(targetKeywords, ", "))

	result, err := groq.CompleteJSON[KeywordCheckResult](ctx, s.groqClient, keywordCheckSystemPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("keyword check failed: %w", err)
	}
	return &result, nil
}
