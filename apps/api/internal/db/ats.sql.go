package db

import (
	"context"
)

type CreateAtsScanParams struct {
	ID               string   `json:"id"`
	UserID           string   `json:"userId"`
	ResumeID         *string  `json:"resumeId"`
	JobTitle         *string  `json:"jobTitle"`
	JobDescription   *string  `json:"jobDescription"`
	OverallScore     int32    `json:"overallScore"`
	FormattingScore  int32    `json:"formattingScore"`
	KeywordsScore    int32    `json:"keywordsScore"`
	ExperienceScore  int32    `json:"experienceScore"`
	EducationScore   int32    `json:"educationScore"`
	SkillsScore      int32    `json:"skillsScore"`
	ReadabilityScore int32    `json:"readabilityScore"`
	Strengths        []string `json:"strengths"`
	Weaknesses       []string `json:"weaknesses"`
	Suggestions      []string `json:"suggestions"`
	MissingKeywords  []string `json:"missingKeywords"`
	MatchedKeywords  []string `json:"matchedKeywords"`
	RawFeedback      string   `json:"rawFeedback"`
}

const createAtsScan = `-- name: CreateAtsScan :one
INSERT INTO ats_scans (
  id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
) RETURNING id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback, created_at
`

func (q *Queries) CreateAtsScan(ctx context.Context, arg CreateAtsScanParams) (AtsScan, error) {
	row := q.db.QueryRow(ctx, createAtsScan,
		arg.ID, arg.UserID, arg.ResumeID, arg.JobTitle, arg.JobDescription,
		arg.OverallScore, arg.FormattingScore, arg.KeywordsScore, arg.ExperienceScore,
		arg.EducationScore, arg.SkillsScore, arg.ReadabilityScore,
		arg.Strengths, arg.Weaknesses, arg.Suggestions, arg.MissingKeywords,
		arg.MatchedKeywords, arg.RawFeedback,
	)
	var s AtsScan
	err := row.Scan(
		&s.ID, &s.UserID, &s.ResumeID, &s.JobTitle, &s.JobDescription,
		&s.OverallScore, &s.FormattingScore, &s.KeywordsScore, &s.ExperienceScore,
		&s.EducationScore, &s.SkillsScore, &s.ReadabilityScore,
		&s.Strengths, &s.Weaknesses, &s.Suggestions, &s.MissingKeywords,
		&s.MatchedKeywords, &s.RawFeedback, &s.CreatedAt,
	)
	return s, err
}

type ListAtsScansByUserParams struct {
	UserID string `json:"userId"`
	Limit  int32  `json:"limit"`
	Offset int32  `json:"offset"`
}

const listAtsScansByUser = `-- name: ListAtsScansByUser :many
SELECT id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback, created_at
FROM ats_scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
`

func (q *Queries) ListAtsScansByUser(ctx context.Context, arg ListAtsScansByUserParams) ([]AtsScan, error) {
	rows, err := q.db.Query(ctx, listAtsScansByUser, arg.UserID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []AtsScan{}
	for rows.Next() {
		var s AtsScan
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.ResumeID, &s.JobTitle, &s.JobDescription,
			&s.OverallScore, &s.FormattingScore, &s.KeywordsScore, &s.ExperienceScore,
			&s.EducationScore, &s.SkillsScore, &s.ReadabilityScore,
			&s.Strengths, &s.Weaknesses, &s.Suggestions, &s.MissingKeywords,
			&s.MatchedKeywords, &s.RawFeedback, &s.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, rows.Err()
}

type GetAtsScanParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const getAtsScan = `-- name: GetAtsScan :one
SELECT id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback, created_at
FROM ats_scans WHERE id = $1 AND user_id = $2
`

func (q *Queries) GetAtsScan(ctx context.Context, arg GetAtsScanParams) (AtsScan, error) {
	row := q.db.QueryRow(ctx, getAtsScan, arg.ID, arg.UserID)
	var s AtsScan
	err := row.Scan(
		&s.ID, &s.UserID, &s.ResumeID, &s.JobTitle, &s.JobDescription,
		&s.OverallScore, &s.FormattingScore, &s.KeywordsScore, &s.ExperienceScore,
		&s.EducationScore, &s.SkillsScore, &s.ReadabilityScore,
		&s.Strengths, &s.Weaknesses, &s.Suggestions, &s.MissingKeywords,
		&s.MatchedKeywords, &s.RawFeedback, &s.CreatedAt,
	)
	return s, err
}

type DeleteAtsScanParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const deleteAtsScan = `-- name: DeleteAtsScan :exec
DELETE FROM ats_scans WHERE id = $1 AND user_id = $2
`

func (q *Queries) DeleteAtsScan(ctx context.Context, arg DeleteAtsScanParams) error {
	_, err := q.db.Exec(ctx, deleteAtsScan, arg.ID, arg.UserID)
	return err
}

const getAvgAtsScore = `-- name: GetAvgAtsScore :one
SELECT COALESCE(AVG(overall_score), 0)::INT AS avg_score FROM ats_scans WHERE user_id = $1
`

func (q *Queries) GetAvgAtsScore(ctx context.Context, userID string) (int32, error) {
	row := q.db.QueryRow(ctx, getAvgAtsScore, userID)
	var avgScore int32
	err := row.Scan(&avgScore)
	return avgScore, err
}

const countAtsScansByUser = `-- name: CountAtsScansByUser :one
SELECT COUNT(*)::INT AS count FROM ats_scans WHERE user_id = $1
`

func (q *Queries) CountAtsScansByUser(ctx context.Context, userID string) (int32, error) {
	row := q.db.QueryRow(ctx, countAtsScansByUser, userID)
	var count int32
	err := row.Scan(&count)
	return count, err
}
