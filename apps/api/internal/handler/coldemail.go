package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/internal/service"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type ColdEmailHandler struct {
	queries      *db.Queries
	emailService *service.ColdEmailService
}

func NewColdEmailHandler(queries *db.Queries, emailService *service.ColdEmailService) *ColdEmailHandler {
	return &ColdEmailHandler{queries: queries, emailService: emailService}
}

type generateEmailRequest struct {
	JobPosting     string `json:"jobPosting"`
	RecruiterName  string `json:"recruiterName"`
	RecruiterEmail string `json:"recruiterEmail"`
	CompanyName    string `json:"companyName"`
}

func (h *ColdEmailHandler) Generate(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	var req generateEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.JobPosting == "" {
		respond.Error(w, http.StatusBadRequest, "jobPosting is required")
		return
	}

	result, err := h.emailService.Generate(r.Context(), user, req.JobPosting, req.RecruiterName, req.RecruiterEmail, req.CompanyName)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "email generation failed")
		return
	}

	var recruiterName *string
	if req.RecruiterName != "" {
		recruiterName = &req.RecruiterName
	}
	var recruiterEmail *string
	if req.RecruiterEmail != "" {
		recruiterEmail = &req.RecruiterEmail
	}

	companyName := &result.ExtractedInfo.CompanyName
	if req.CompanyName != "" {
		companyName = &req.CompanyName
	}
	jobTitle := &result.ExtractedInfo.JobTitle

	var followUp1 *string
	if result.FollowUp1 != "" {
		followUp1 = &result.FollowUp1
	}
	var followUp2 *string
	if result.FollowUp2 != "" {
		followUp2 = &result.FollowUp2
	}

	email, err := h.queries.CreateColdEmail(r.Context(), db.CreateColdEmailParams{
		ID:             uuid.New().String(),
		UserID:         user.ID,
		JobPosting:     req.JobPosting,
		RecruiterName:  recruiterName,
		RecruiterEmail: recruiterEmail,
		CompanyName:    companyName,
		JobTitle:       jobTitle,
		Subject:        result.Subject,
		Body:           result.Body,
		FollowUp1:      followUp1,
		FollowUp2:      followUp2,
		Tone:           user.EmailTone,
		Style:          user.EmailStyle,
		IsSaved:        false,
		Label:          nil,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to save email")
		return
	}

	respond.JSON(w, http.StatusCreated, email)
}

func (h *ColdEmailHandler) List(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	limit := int32(20)
	offset := int32(0)

	if l := r.URL.Query().Get("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 && v <= 100 {
			limit = int32(v)
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if v, err := strconv.Atoi(o); err == nil && v >= 0 {
			offset = int32(v)
		}
	}

	emails, err := h.queries.ListColdEmailsByUser(r.Context(), db.ListColdEmailsByUserParams{
		UserID: user.ID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to list emails")
		return
	}

	respond.JSON(w, http.StatusOK, emails)
}

func (h *ColdEmailHandler) Get(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	email, err := h.queries.GetColdEmail(r.Context(), db.GetColdEmailParams{ID: id, UserID: user.ID})
	if err != nil {
		respond.Error(w, http.StatusNotFound, "email not found")
		return
	}

	respond.JSON(w, http.StatusOK, email)
}

type updateEmailRequest struct {
	Subject *string `json:"subject"`
	Body    *string `json:"body"`
	IsSaved *bool   `json:"isSaved"`
	Label   *string `json:"label"`
}

func (h *ColdEmailHandler) Update(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	var req updateEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	email, err := h.queries.UpdateColdEmail(r.Context(), db.UpdateColdEmailParams{
		ID:      id,
		UserID:  user.ID,
		Subject: req.Subject,
		Body:    req.Body,
		IsSaved: req.IsSaved,
		Label:   req.Label,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to update email")
		return
	}

	respond.JSON(w, http.StatusOK, email)
}

func (h *ColdEmailHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	if err := h.queries.DeleteColdEmail(r.Context(), db.DeleteColdEmailParams{ID: id, UserID: user.ID}); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to delete email")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "email deleted"})
}
