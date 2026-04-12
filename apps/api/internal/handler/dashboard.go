package handler

import (
	"net/http"

	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type DashboardHandler struct {
	queries *db.Queries
}

func NewDashboardHandler(queries *db.Queries) *DashboardHandler {
	return &DashboardHandler{queries: queries}
}

type dashboardStats struct {
	TotalResumes    int32 `json:"totalResumes"`
	TotalColdEmails int32 `json:"totalColdEmails"`
}

func (h *DashboardHandler) Stats(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	ctx := r.Context()

	totalResumes, err := h.queries.CountResumesByUser(ctx, user.ID)
	if err != nil {
		totalResumes = 0
	}

	totalColdEmails, err := h.queries.CountColdEmailsByUser(ctx, user.ID)
	if err != nil {
		totalColdEmails = 0
	}

	stats := dashboardStats{
		TotalResumes:    totalResumes,
		TotalColdEmails: totalColdEmails,
	}

	respond.JSON(w, http.StatusOK, stats)
}

type activityItem struct {
	Type      string `json:"type"`
	Title     string `json:"title"`
	Subtitle  string `json:"subtitle"`
	Timestamp string `json:"timestamp"`
}

func (h *DashboardHandler) Activity(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	ctx := r.Context()

	var items []activityItem

	// Recent cold emails
	emails, err := h.queries.ListColdEmailsByUser(ctx, db.ListColdEmailsByUserParams{
		UserID: user.ID,
		Limit:  15,
		Offset: 0,
	})
	if err == nil {
		for _, e := range emails {
			title := "Cold Email"
			if e.CompanyName != nil {
				title = "Cold Email: " + *e.CompanyName
			}
			items = append(items, activityItem{
				Type:      "cold_email",
				Title:     title,
				Subtitle:  e.Subject,
				Timestamp: e.CreatedAt.Format("2006-01-02T15:04:05Z"),
			})
		}
	}

	respond.JSON(w, http.StatusOK, items)
}

