package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type TrackerHandler struct {
	queries *db.Queries
}

func NewTrackerHandler(queries *db.Queries) *TrackerHandler {
	return &TrackerHandler{queries: queries}
}

func (h *TrackerHandler) List(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	limit := int32(50)
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

	apps, err := h.queries.ListJobApplicationsByUser(r.Context(), db.ListJobApplicationsByUserParams{
		UserID: user.ID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to list applications")
		return
	}

	respond.JSON(w, http.StatusOK, apps)
}

type createApplicationRequest struct {
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

func (h *TrackerHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	var req createApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.CompanyName == "" || req.JobTitle == "" {
		respond.Error(w, http.StatusBadRequest, "companyName and jobTitle are required")
		return
	}

	status := req.Status
	if status == "" {
		status = "SAVED"
	}

	app, err := h.queries.CreateJobApplication(r.Context(), db.CreateJobApplicationParams{
		ID:          uuid.New().String(),
		UserID:      user.ID,
		CompanyName: req.CompanyName,
		JobTitle:    req.JobTitle,
		JobURL:      req.JobURL,
		Status:      status,
		AppliedAt:   req.AppliedAt,
		Notes:       req.Notes,
		SalaryMin:   req.SalaryMin,
		SalaryMax:   req.SalaryMax,
		Location:    req.Location,
		IsRemote:    req.IsRemote,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to create application")
		return
	}

	respond.JSON(w, http.StatusCreated, app)
}

type updateApplicationRequest struct {
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

func (h *TrackerHandler) Update(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	var req updateApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	app, err := h.queries.UpdateJobApplication(r.Context(), db.UpdateJobApplicationParams{
		ID:          id,
		UserID:      user.ID,
		CompanyName: req.CompanyName,
		JobTitle:    req.JobTitle,
		JobURL:      req.JobURL,
		Status:      req.Status,
		AppliedAt:   req.AppliedAt,
		Notes:       req.Notes,
		SalaryMin:   req.SalaryMin,
		SalaryMax:   req.SalaryMax,
		Location:    req.Location,
		IsRemote:    req.IsRemote,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to update application")
		return
	}

	respond.JSON(w, http.StatusOK, app)
}

func (h *TrackerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	if err := h.queries.DeleteJobApplication(r.Context(), db.DeleteJobApplicationParams{ID: id, UserID: user.ID}); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to delete application")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "application deleted"})
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *TrackerHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Status == "" {
		respond.Error(w, http.StatusBadRequest, "status is required")
		return
	}

	app, err := h.queries.UpdateJobApplicationStatus(r.Context(), db.UpdateJobApplicationStatusParams{
		ID:     id,
		UserID: user.ID,
		Status: req.Status,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	respond.JSON(w, http.StatusOK, app)
}
