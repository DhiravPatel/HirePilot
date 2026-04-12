package handler

import (
	"encoding/json"
	"net/http"

	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type UserHandler struct {
	queries *db.Queries
}

func NewUserHandler(queries *db.Queries) *UserHandler {
	return &UserHandler{queries: queries}
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	respond.JSON(w, http.StatusOK, user)
}

type updateUserRequest struct {
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

func (h *UserHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	var req updateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.queries.UpdateUser(r.Context(), db.UpdateUserParams{
		ID:                user.ID,
		Name:              req.Name,
		Headline:          req.Headline,
		CurrentRole:       req.CurrentRole,
		TargetRole:        req.TargetRole,
		YearsOfExperience: req.YearsOfExperience,
		Skills:            req.Skills,
		LinkedinURL:       req.LinkedinURL,
		GithubURL:         req.GithubURL,
		PortfolioURL:      req.PortfolioURL,
		Phone:             req.Phone,
		Location:          req.Location,
		Bio:               req.Bio,
		EmailTone:         req.EmailTone,
		EmailStyle:        req.EmailStyle,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to update user")
		return
	}

	respond.JSON(w, http.StatusOK, updated)
}

func (h *UserHandler) CompleteOnboarding(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	updated, err := h.queries.CompleteOnboarding(r.Context(), user.ID)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to complete onboarding")
		return
	}

	respond.JSON(w, http.StatusOK, updated)
}

func (h *UserHandler) DeleteMe(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	if err := h.queries.DeleteUser(r.Context(), user.ID); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to delete user")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "account deleted"})
}
