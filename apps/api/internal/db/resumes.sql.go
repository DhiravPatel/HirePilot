package db

import (
	"context"
)

type CreateResumeParams struct {
	ID           string `json:"id"`
	UserID       string `json:"userId"`
	Name         string `json:"name"`
	FileID       string `json:"fileId"`
	FileURL      string `json:"fileUrl"`
	OriginalName string `json:"originalName"`
	FileSize     int32  `json:"fileSize"`
	MimeType     string `json:"mimeType"`
	IsDefault    bool   `json:"isDefault"`
}

const createResume = `-- name: CreateResume :one
INSERT INTO resumes (id, user_id, name, file_id, file_url, original_name, file_size, mime_type, is_default)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, user_id, name, file_id, file_url, original_name, file_size, mime_type, is_default, created_at, updated_at
`

func (q *Queries) CreateResume(ctx context.Context, arg CreateResumeParams) (Resume, error) {
	row := q.db.QueryRow(ctx, createResume,
		arg.ID, arg.UserID, arg.Name, arg.FileID, arg.FileURL,
		arg.OriginalName, arg.FileSize, arg.MimeType, arg.IsDefault,
	)
	var r Resume
	err := row.Scan(
		&r.ID, &r.UserID, &r.Name, &r.FileID, &r.FileURL,
		&r.OriginalName, &r.FileSize, &r.MimeType, &r.IsDefault,
		&r.CreatedAt, &r.UpdatedAt,
	)
	return r, err
}

const listResumesByUser = `-- name: ListResumesByUser :many
SELECT id, user_id, name, file_id, file_url, original_name, file_size, mime_type, is_default, created_at, updated_at
FROM resumes WHERE user_id = $1 ORDER BY created_at DESC
`

func (q *Queries) ListResumesByUser(ctx context.Context, userID string) ([]Resume, error) {
	rows, err := q.db.Query(ctx, listResumesByUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Resume{}
	for rows.Next() {
		var r Resume
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.Name, &r.FileID, &r.FileURL,
			&r.OriginalName, &r.FileSize, &r.MimeType, &r.IsDefault,
			&r.CreatedAt, &r.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, r)
	}
	return items, rows.Err()
}

type GetResumeParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const getResume = `-- name: GetResume :one
SELECT id, user_id, name, file_id, file_url, original_name, file_size, mime_type, is_default, created_at, updated_at
FROM resumes WHERE id = $1 AND user_id = $2
`

func (q *Queries) GetResume(ctx context.Context, arg GetResumeParams) (Resume, error) {
	row := q.db.QueryRow(ctx, getResume, arg.ID, arg.UserID)
	var r Resume
	err := row.Scan(
		&r.ID, &r.UserID, &r.Name, &r.FileID, &r.FileURL,
		&r.OriginalName, &r.FileSize, &r.MimeType, &r.IsDefault,
		&r.CreatedAt, &r.UpdatedAt,
	)
	return r, err
}

type DeleteResumeParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const deleteResume = `-- name: DeleteResume :exec
DELETE FROM resumes WHERE id = $1 AND user_id = $2
`

func (q *Queries) DeleteResume(ctx context.Context, arg DeleteResumeParams) error {
	_, err := q.db.Exec(ctx, deleteResume, arg.ID, arg.UserID)
	return err
}

type SetDefaultResumeParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const setDefaultResume = `-- name: SetDefaultResume :exec
UPDATE resumes SET is_default = TRUE WHERE id = $1 AND user_id = $2
`

func (q *Queries) SetDefaultResume(ctx context.Context, arg SetDefaultResumeParams) error {
	_, err := q.db.Exec(ctx, setDefaultResume, arg.ID, arg.UserID)
	return err
}

const unsetDefaultResumes = `-- name: UnsetDefaultResumes :exec
UPDATE resumes SET is_default = FALSE WHERE user_id = $1
`

func (q *Queries) UnsetDefaultResumes(ctx context.Context, userID string) error {
	_, err := q.db.Exec(ctx, unsetDefaultResumes, userID)
	return err
}

const countResumesByUser = `-- name: CountResumesByUser :one
SELECT COUNT(*)::INT AS count FROM resumes WHERE user_id = $1
`

func (q *Queries) CountResumesByUser(ctx context.Context, userID string) (int32, error) {
	row := q.db.QueryRow(ctx, countResumesByUser, userID)
	var count int32
	err := row.Scan(&count)
	return count, err
}
