-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: GetUserByGoogleID :one
SELECT * FROM users WHERE google_id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (id, email, name, image, google_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateUser :one
UPDATE users SET
  name                = COALESCE($2, name),
  headline            = COALESCE($3, headline),
  current_role        = COALESCE($4, current_role),
  target_role         = COALESCE($5, target_role),
  years_of_experience = COALESCE($6, years_of_experience),
  skills              = COALESCE($7, skills),
  linkedin_url        = COALESCE($8, linkedin_url),
  github_url          = COALESCE($9, github_url),
  portfolio_url       = COALESCE($10, portfolio_url),
  phone               = COALESCE($11, phone),
  location            = COALESCE($12, location),
  bio                 = COALESCE($13, bio),
  email_tone          = COALESCE($14, email_tone),
  email_style         = COALESCE($15, email_style)
WHERE id = $1
RETURNING *;

-- name: CompleteOnboarding :one
UPDATE users SET onboarding_done = TRUE WHERE id = $1 RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
