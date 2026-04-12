package db

import (
	"context"
)

type CreateColdEmailParams struct {
	ID             string  `json:"id"`
	UserID         string  `json:"userId"`
	JobPosting     string  `json:"jobPosting"`
	RecruiterName  *string `json:"recruiterName"`
	RecruiterEmail *string `json:"recruiterEmail"`
	CompanyName    *string `json:"companyName"`
	JobTitle       *string `json:"jobTitle"`
	Subject        string  `json:"subject"`
	Body           string  `json:"body"`
	FollowUp1      *string `json:"followUp1"`
	FollowUp2      *string `json:"followUp2"`
	Tone           string  `json:"tone"`
	Style          string  `json:"style"`
	IsSaved        bool    `json:"isSaved"`
	Label          *string `json:"label"`
}

const createColdEmail = `-- name: CreateColdEmail :one
INSERT INTO cold_emails (
  id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
) RETURNING id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label, created_at
`

func (q *Queries) CreateColdEmail(ctx context.Context, arg CreateColdEmailParams) (ColdEmail, error) {
	row := q.db.QueryRow(ctx, createColdEmail,
		arg.ID, arg.UserID, arg.JobPosting, arg.RecruiterName, arg.RecruiterEmail,
		arg.CompanyName, arg.JobTitle, arg.Subject, arg.Body, arg.FollowUp1, arg.FollowUp2,
		arg.Tone, arg.Style, arg.IsSaved, arg.Label,
	)
	var e ColdEmail
	err := row.Scan(
		&e.ID, &e.UserID, &e.JobPosting, &e.RecruiterName, &e.RecruiterEmail,
		&e.CompanyName, &e.JobTitle, &e.Subject, &e.Body, &e.FollowUp1, &e.FollowUp2,
		&e.Tone, &e.Style, &e.IsSaved, &e.Label, &e.CreatedAt,
	)
	return e, err
}

type ListColdEmailsByUserParams struct {
	UserID string `json:"userId"`
	Limit  int32  `json:"limit"`
	Offset int32  `json:"offset"`
}

const listColdEmailsByUser = `-- name: ListColdEmailsByUser :many
SELECT id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label, created_at
FROM cold_emails WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
`

func (q *Queries) ListColdEmailsByUser(ctx context.Context, arg ListColdEmailsByUserParams) ([]ColdEmail, error) {
	rows, err := q.db.Query(ctx, listColdEmailsByUser, arg.UserID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []ColdEmail{}
	for rows.Next() {
		var e ColdEmail
		if err := rows.Scan(
			&e.ID, &e.UserID, &e.JobPosting, &e.RecruiterName, &e.RecruiterEmail,
			&e.CompanyName, &e.JobTitle, &e.Subject, &e.Body, &e.FollowUp1, &e.FollowUp2,
			&e.Tone, &e.Style, &e.IsSaved, &e.Label, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}

type GetColdEmailParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const getColdEmail = `-- name: GetColdEmail :one
SELECT id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label, created_at
FROM cold_emails WHERE id = $1 AND user_id = $2
`

func (q *Queries) GetColdEmail(ctx context.Context, arg GetColdEmailParams) (ColdEmail, error) {
	row := q.db.QueryRow(ctx, getColdEmail, arg.ID, arg.UserID)
	var e ColdEmail
	err := row.Scan(
		&e.ID, &e.UserID, &e.JobPosting, &e.RecruiterName, &e.RecruiterEmail,
		&e.CompanyName, &e.JobTitle, &e.Subject, &e.Body, &e.FollowUp1, &e.FollowUp2,
		&e.Tone, &e.Style, &e.IsSaved, &e.Label, &e.CreatedAt,
	)
	return e, err
}

type UpdateColdEmailParams struct {
	ID      string  `json:"id"`
	UserID  string  `json:"userId"`
	Subject *string `json:"subject"`
	Body    *string `json:"body"`
	IsSaved *bool   `json:"isSaved"`
	Label   *string `json:"label"`
}

const updateColdEmail = `-- name: UpdateColdEmail :one
UPDATE cold_emails SET
  subject   = COALESCE($3, subject),
  body      = COALESCE($4, body),
  is_saved  = COALESCE($5, is_saved),
  label     = COALESCE($6, label)
WHERE id = $1 AND user_id = $2
RETURNING id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label, created_at
`

func (q *Queries) UpdateColdEmail(ctx context.Context, arg UpdateColdEmailParams) (ColdEmail, error) {
	row := q.db.QueryRow(ctx, updateColdEmail,
		arg.ID, arg.UserID, arg.Subject, arg.Body, arg.IsSaved, arg.Label,
	)
	var e ColdEmail
	err := row.Scan(
		&e.ID, &e.UserID, &e.JobPosting, &e.RecruiterName, &e.RecruiterEmail,
		&e.CompanyName, &e.JobTitle, &e.Subject, &e.Body, &e.FollowUp1, &e.FollowUp2,
		&e.Tone, &e.Style, &e.IsSaved, &e.Label, &e.CreatedAt,
	)
	return e, err
}

type DeleteColdEmailParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const deleteColdEmail = `-- name: DeleteColdEmail :exec
DELETE FROM cold_emails WHERE id = $1 AND user_id = $2
`

func (q *Queries) DeleteColdEmail(ctx context.Context, arg DeleteColdEmailParams) error {
	_, err := q.db.Exec(ctx, deleteColdEmail, arg.ID, arg.UserID)
	return err
}

const countColdEmailsByUser = `-- name: CountColdEmailsByUser :one
SELECT COUNT(*)::INT AS count FROM cold_emails WHERE user_id = $1
`

func (q *Queries) CountColdEmailsByUser(ctx context.Context, userID string) (int32, error) {
	row := q.db.QueryRow(ctx, countColdEmailsByUser, userID)
	var count int32
	err := row.Scan(&count)
	return count, err
}
