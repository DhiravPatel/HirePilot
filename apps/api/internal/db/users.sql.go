package db

import (
	"context"
)

const getUserByEmail = `-- name: GetUserByEmail :one
SELECT id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
FROM users WHERE email = $1 LIMIT 1
`

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRow(ctx, getUserByEmail, email)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

const getUserByID = `-- name: GetUserByID :one
SELECT id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
FROM users WHERE id = $1 LIMIT 1
`

func (q *Queries) GetUserByID(ctx context.Context, id string) (User, error) {
	row := q.db.QueryRow(ctx, getUserByID, id)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

const getUserByGoogleID = `-- name: GetUserByGoogleID :one
SELECT id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
FROM users WHERE google_id = $1 LIMIT 1
`

func (q *Queries) GetUserByGoogleID(ctx context.Context, googleID string) (User, error) {
	row := q.db.QueryRow(ctx, getUserByGoogleID, googleID)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

type CreateUserParams struct {
	ID       string  `json:"id"`
	Email    string  `json:"email"`
	Name     *string `json:"name"`
	Image    *string `json:"image"`
	GoogleID *string `json:"googleId"`
}

const createUser = `-- name: CreateUser :one
INSERT INTO users (id, email, name, image, google_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
`

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRow(ctx, createUser, arg.ID, arg.Email, arg.Name, arg.Image, arg.GoogleID)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

type UpdateUserParams struct {
	ID                string   `json:"id"`
	Name              *string  `json:"name"`
	Headline          *string  `json:"headline"`
	CurrentRole       *string  `json:"currentRole"`
	TargetRole        *string  `json:"targetRole"`
	YearsOfExperience *int32   `json:"yearsOfExperience"`
	Skills            []string `json:"skills"`
	LinkedinURL       *string  `json:"linkedinUrl"`
	GithubURL         *string  `json:"githubUrl"`
	PortfolioURL      *string  `json:"portfolioUrl"`
	Phone             *string  `json:"phone"`
	Location          *string  `json:"location"`
	Bio               *string  `json:"bio"`
	EmailTone         *string  `json:"emailTone"`
	EmailStyle        *string  `json:"emailStyle"`
}

const updateUser = `-- name: UpdateUser :one
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
RETURNING id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
`

func (q *Queries) UpdateUser(ctx context.Context, arg UpdateUserParams) (User, error) {
	row := q.db.QueryRow(ctx, updateUser,
		arg.ID, arg.Name, arg.Headline, arg.CurrentRole, arg.TargetRole,
		arg.YearsOfExperience, arg.Skills, arg.LinkedinURL, arg.GithubURL,
		arg.PortfolioURL, arg.Phone, arg.Location, arg.Bio,
		arg.EmailTone, arg.EmailStyle,
	)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

const completeOnboarding = `-- name: CompleteOnboarding :one
UPDATE users SET onboarding_done = TRUE WHERE id = $1
RETURNING id, email, name, image, google_id, onboarding_done, headline, current_role, target_role,
  years_of_experience, skills, linkedin_url, github_url, portfolio_url, phone, location, bio,
  email_tone, email_style, created_at, updated_at
`

func (q *Queries) CompleteOnboarding(ctx context.Context, id string) (User, error) {
	row := q.db.QueryRow(ctx, completeOnboarding, id)
	var u User
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &u.Image, &u.GoogleID, &u.OnboardingDone,
		&u.Headline, &u.CurrentRole, &u.TargetRole, &u.YearsOfExperience,
		&u.Skills, &u.LinkedinURL, &u.GithubURL, &u.PortfolioURL,
		&u.Phone, &u.Location, &u.Bio, &u.EmailTone, &u.EmailStyle,
		&u.CreatedAt, &u.UpdatedAt,
	)
	return u, err
}

const deleteUser = `-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1
`

func (q *Queries) DeleteUser(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteUser, id)
	return err
}
