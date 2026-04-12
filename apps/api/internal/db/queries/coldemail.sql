-- name: CreateColdEmail :one
INSERT INTO cold_emails (
  id, user_id, job_posting, recruiter_name, recruiter_email,
  company_name, job_title, subject, body, follow_up_1, follow_up_2,
  tone, style, is_saved, label
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
) RETURNING *;

-- name: ListColdEmailsByUser :many
SELECT * FROM cold_emails WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: GetColdEmail :one
SELECT * FROM cold_emails WHERE id = $1 AND user_id = $2;

-- name: UpdateColdEmail :one
UPDATE cold_emails SET
  subject   = COALESCE($3, subject),
  body      = COALESCE($4, body),
  is_saved  = COALESCE($5, is_saved),
  label     = COALESCE($6, label)
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteColdEmail :exec
DELETE FROM cold_emails WHERE id = $1 AND user_id = $2;

-- name: CountColdEmailsByUser :one
SELECT COUNT(*)::INT AS count FROM cold_emails WHERE user_id = $1;
