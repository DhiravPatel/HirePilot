package db

import (
	"context"
	"time"
)

type CreateJobApplicationParams struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	CompanyName string     `json:"companyName"`
	JobTitle    string     `json:"jobTitle"`
	JobURL      *string    `json:"jobUrl"`
	Status      string     `json:"status"`
	AppliedAt   *time.Time `json:"appliedAt"`
	Notes       *string    `json:"notes"`
	SalaryMin   *int32     `json:"salaryMin"`
	SalaryMax   *int32     `json:"salaryMax"`
	Location    *string    `json:"location"`
	IsRemote    bool       `json:"isRemote"`
}

const createJobApplication = `-- name: CreateJobApplication :one
INSERT INTO job_applications (
  id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
) RETURNING id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote, created_at, updated_at
`

func (q *Queries) CreateJobApplication(ctx context.Context, arg CreateJobApplicationParams) (JobApplication, error) {
	row := q.db.QueryRow(ctx, createJobApplication,
		arg.ID, arg.UserID, arg.CompanyName, arg.JobTitle, arg.JobURL, arg.Status,
		arg.AppliedAt, arg.Notes, arg.SalaryMin, arg.SalaryMax, arg.Location, arg.IsRemote,
	)
	var j JobApplication
	err := row.Scan(
		&j.ID, &j.UserID, &j.CompanyName, &j.JobTitle, &j.JobURL, &j.Status,
		&j.AppliedAt, &j.Notes, &j.SalaryMin, &j.SalaryMax, &j.Location, &j.IsRemote,
		&j.CreatedAt, &j.UpdatedAt,
	)
	return j, err
}

type ListJobApplicationsByUserParams struct {
	UserID string `json:"userId"`
	Limit  int32  `json:"limit"`
	Offset int32  `json:"offset"`
}

const listJobApplicationsByUser = `-- name: ListJobApplicationsByUser :many
SELECT id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote, created_at, updated_at
FROM job_applications WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3
`

func (q *Queries) ListJobApplicationsByUser(ctx context.Context, arg ListJobApplicationsByUserParams) ([]JobApplication, error) {
	rows, err := q.db.Query(ctx, listJobApplicationsByUser, arg.UserID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []JobApplication{}
	for rows.Next() {
		var j JobApplication
		if err := rows.Scan(
			&j.ID, &j.UserID, &j.CompanyName, &j.JobTitle, &j.JobURL, &j.Status,
			&j.AppliedAt, &j.Notes, &j.SalaryMin, &j.SalaryMax, &j.Location, &j.IsRemote,
			&j.CreatedAt, &j.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, j)
	}
	return items, rows.Err()
}

type GetJobApplicationParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const getJobApplication = `-- name: GetJobApplication :one
SELECT id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote, created_at, updated_at
FROM job_applications WHERE id = $1 AND user_id = $2
`

func (q *Queries) GetJobApplication(ctx context.Context, arg GetJobApplicationParams) (JobApplication, error) {
	row := q.db.QueryRow(ctx, getJobApplication, arg.ID, arg.UserID)
	var j JobApplication
	err := row.Scan(
		&j.ID, &j.UserID, &j.CompanyName, &j.JobTitle, &j.JobURL, &j.Status,
		&j.AppliedAt, &j.Notes, &j.SalaryMin, &j.SalaryMax, &j.Location, &j.IsRemote,
		&j.CreatedAt, &j.UpdatedAt,
	)
	return j, err
}

type UpdateJobApplicationParams struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	CompanyName *string    `json:"companyName"`
	JobTitle    *string    `json:"jobTitle"`
	JobURL      *string    `json:"jobUrl"`
	Status      *string    `json:"status"`
	AppliedAt   *time.Time `json:"appliedAt"`
	Notes       *string    `json:"notes"`
	SalaryMin   *int32     `json:"salaryMin"`
	SalaryMax   *int32     `json:"salaryMax"`
	Location    *string    `json:"location"`
	IsRemote    *bool      `json:"isRemote"`
}

const updateJobApplication = `-- name: UpdateJobApplication :one
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
RETURNING id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote, created_at, updated_at
`

func (q *Queries) UpdateJobApplication(ctx context.Context, arg UpdateJobApplicationParams) (JobApplication, error) {
	row := q.db.QueryRow(ctx, updateJobApplication,
		arg.ID, arg.UserID, arg.CompanyName, arg.JobTitle, arg.JobURL, arg.Status,
		arg.AppliedAt, arg.Notes, arg.SalaryMin, arg.SalaryMax, arg.Location, arg.IsRemote,
	)
	var j JobApplication
	err := row.Scan(
		&j.ID, &j.UserID, &j.CompanyName, &j.JobTitle, &j.JobURL, &j.Status,
		&j.AppliedAt, &j.Notes, &j.SalaryMin, &j.SalaryMax, &j.Location, &j.IsRemote,
		&j.CreatedAt, &j.UpdatedAt,
	)
	return j, err
}

type DeleteJobApplicationParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

const deleteJobApplication = `-- name: DeleteJobApplication :exec
DELETE FROM job_applications WHERE id = $1 AND user_id = $2
`

func (q *Queries) DeleteJobApplication(ctx context.Context, arg DeleteJobApplicationParams) error {
	_, err := q.db.Exec(ctx, deleteJobApplication, arg.ID, arg.UserID)
	return err
}

type UpdateJobApplicationStatusParams struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
	Status string `json:"status"`
}

const updateJobApplicationStatus = `-- name: UpdateJobApplicationStatus :one
UPDATE job_applications SET status = $3 WHERE id = $1 AND user_id = $2
RETURNING id, user_id, company_name, job_title, job_url, status,
  applied_at, notes, salary_min, salary_max, location, is_remote, created_at, updated_at
`

func (q *Queries) UpdateJobApplicationStatus(ctx context.Context, arg UpdateJobApplicationStatusParams) (JobApplication, error) {
	row := q.db.QueryRow(ctx, updateJobApplicationStatus, arg.ID, arg.UserID, arg.Status)
	var j JobApplication
	err := row.Scan(
		&j.ID, &j.UserID, &j.CompanyName, &j.JobTitle, &j.JobURL, &j.Status,
		&j.AppliedAt, &j.Notes, &j.SalaryMin, &j.SalaryMax, &j.Location, &j.IsRemote,
		&j.CreatedAt, &j.UpdatedAt,
	)
	return j, err
}

const countJobApplicationsByUser = `-- name: CountJobApplicationsByUser :one
SELECT COUNT(*)::INT AS count FROM job_applications WHERE user_id = $1
`

func (q *Queries) CountJobApplicationsByUser(ctx context.Context, userID string) (int32, error) {
	row := q.db.QueryRow(ctx, countJobApplicationsByUser, userID)
	var count int32
	err := row.Scan(&count)
	return count, err
}

const countJobApplicationsByStatus = `-- name: CountJobApplicationsByStatus :many
SELECT status, COUNT(*)::INT AS count FROM job_applications WHERE user_id = $1 GROUP BY status
`

func (q *Queries) CountJobApplicationsByStatus(ctx context.Context, userID string) ([]StatusCount, error) {
	rows, err := q.db.Query(ctx, countJobApplicationsByStatus, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []StatusCount{}
	for rows.Next() {
		var sc StatusCount
		if err := rows.Scan(&sc.Status, &sc.Count); err != nil {
			return nil, err
		}
		items = append(items, sc)
	}
	return items, rows.Err()
}
