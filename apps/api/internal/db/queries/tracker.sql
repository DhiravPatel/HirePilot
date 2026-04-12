-- name: CreateJobApplication :one
INSERT INTO job_applications (
  id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
) RETURNING *;

-- name: ListJobApplicationsByUser :many
SELECT * FROM job_applications WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3;

-- name: GetJobApplication :one
SELECT * FROM job_applications WHERE id = $1 AND user_id = $2;

-- name: UpdateJobApplication :one
UPDATE job_applications SET
  company_name = COALESCE($3, company_name),
  job_title    = COALESCE($4, job_title),
  job_url      = COALESCE($5, job_url),
  status       = COALESCE($6, status),
  applied_at   = COALESCE($7, applied_at),
  notes        = COALESCE($8, notes),
  salary_min   = COALESCE($9, salary_min),
  salary_max   = COALESCE($10, salary_max),
  location     = COALESCE($11, location),
  is_remote    = COALESCE($12, is_remote)
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteJobApplication :exec
DELETE FROM job_applications WHERE id = $1 AND user_id = $2;

-- name: UpdateJobApplicationStatus :one
UPDATE job_applications SET status = $3 WHERE id = $1 AND user_id = $2 RETURNING *;

-- name: CountJobApplicationsByUser :one
SELECT COUNT(*)::INT AS count FROM job_applications WHERE user_id = $1;

-- name: CountJobApplicationsByStatus :many
SELECT status, COUNT(*)::INT AS count FROM job_applications WHERE user_id = $1 GROUP BY status;
