-- name: CreateAtsScan :one
INSERT INTO ats_scans (
  id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
) RETURNING *;

-- name: ListAtsScansByUser :many
SELECT * FROM ats_scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: GetAtsScan :one
SELECT * FROM ats_scans WHERE id = $1 AND user_id = $2;

-- name: DeleteAtsScan :exec
DELETE FROM ats_scans WHERE id = $1 AND user_id = $2;

-- name: GetAvgAtsScore :one
SELECT COALESCE(AVG(overall_score), 0)::INT AS avg_score FROM ats_scans WHERE user_id = $1;

-- name: CountAtsScansByUser :one
SELECT COUNT(*)::INT AS count FROM ats_scans WHERE user_id = $1;
