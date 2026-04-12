package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/yourusername/hirepilot/api/internal/config"
	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type AuthHandler struct {
	queries *db.Queries
	cfg     *config.Config
}

func NewAuthHandler(queries *db.Queries, cfg *config.Config) *AuthHandler {
	return &AuthHandler{queries: queries, cfg: cfg}
}

type syncUserRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Image    string `json:"image"`
	GoogleID string `json:"googleId"`
}

func (h *AuthHandler) SyncUser(w http.ResponseWriter, r *http.Request) {
	var req syncUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" {
		respond.Error(w, http.StatusBadRequest, "email is required")
		return
	}

	// Try to find existing user by email
	user, err := h.queries.GetUserByEmail(r.Context(), req.Email)
	if err == nil {
		// User exists, return it
		respond.JSON(w, http.StatusOK, user)
		return
	}

	// Try by Google ID if provided
	if req.GoogleID != "" {
		user, err = h.queries.GetUserByGoogleID(r.Context(), req.GoogleID)
		if err == nil {
			respond.JSON(w, http.StatusOK, user)
			return
		}
	}

	// Create new user
	var name *string
	if req.Name != "" {
		name = &req.Name
	}
	var image *string
	if req.Image != "" {
		image = &req.Image
	}
	var googleID *string
	if req.GoogleID != "" {
		googleID = &req.GoogleID
	}

	user, err = h.queries.CreateUser(r.Context(), db.CreateUserParams{
		ID:       uuid.New().String(),
		Email:    req.Email,
		Name:     name,
		Image:    image,
		GoogleID: googleID,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	respond.JSON(w, http.StatusCreated, user)
}
