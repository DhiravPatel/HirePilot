-- name: CreateResume :one
INSERT INTO resumes (id, user_id, name, file_id, file_url, original_name, file_size, mime_type, is_default)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: ListResumesByUser :many
SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC;

-- name: GetResume :one
SELECT * FROM resumes WHERE id = $1 AND user_id = $2;

-- name: DeleteResume :exec
DELETE FROM resumes WHERE id = $1 AND user_id = $2;

-- name: SetDefaultResume :exec
UPDATE resumes SET is_default = TRUE WHERE id = $1 AND user_id = $2;

-- name: UnsetDefaultResumes :exec
UPDATE resumes SET is_default = FALSE WHERE user_id = $1;

-- name: CountResumesByUser :one
SELECT COUNT(*)::INT AS count FROM resumes WHERE user_id = $1;
