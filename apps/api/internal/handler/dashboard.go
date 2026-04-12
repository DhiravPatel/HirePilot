package handler

import (
	"net/http"
	"strconv"

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
	TotalResumes      int32          `json:"totalResumes"`
	TotalAtsScans     int32          `json:"totalAtsScans"`
	AvgAtsScore       int32          `json:"avgAtsScore"`
	TotalColdEmails   int32          `json:"totalColdEmails"`
	TotalApplications int32          `json:"totalApplications"`
	ApplicationsByStatus []db.StatusCount `json:"applicationsByStatus"`
}

func (h *DashboardHandler) Stats(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	ctx := r.Context()

	totalResumes, err := h.queries.CountResumesByUser(ctx, user.ID)
	if err != nil {
		totalResumes = 0
	}

	totalAtsScans, err := h.queries.CountAtsScansByUser(ctx, user.ID)
	if err != nil {
		totalAtsScans = 0
	}

	avgAtsScore, err := h.queries.GetAvgAtsScore(ctx, user.ID)
	if err != nil {
		avgAtsScore = 0
	}

	totalColdEmails, err := h.queries.CountColdEmailsByUser(ctx, user.ID)
	if err != nil {
		totalColdEmails = 0
	}

	totalApplications, err := h.queries.CountJobApplicationsByUser(ctx, user.ID)
	if err != nil {
		totalApplications = 0
	}

	appsByStatus, err := h.queries.CountJobApplicationsByStatus(ctx, user.ID)
	if err != nil {
		appsByStatus = []db.StatusCount{}
	}

	stats := dashboardStats{
		TotalResumes:         totalResumes,
		TotalAtsScans:        totalAtsScans,
		AvgAtsScore:          avgAtsScore,
		TotalColdEmails:      totalColdEmails,
		TotalApplications:    totalApplications,
		ApplicationsByStatus: appsByStatus,
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

	// Recent ATS scans
	scans, err := h.queries.ListAtsScansByUser(ctx, db.ListAtsScansByUserParams{
		UserID: user.ID,
		Limit:  5,
		Offset: 0,
	})
	if err == nil {
		for _, s := range scans {
			title := "ATS Scan"
			if s.JobTitle != nil {
				title = "ATS Scan: " + *s.JobTitle
			}
			items = append(items, activityItem{
				Type:      "ats_scan",
				Title:     title,
				Subtitle:  "Score: " + strconv.Itoa(int(s.OverallScore)) + "/100",
				Timestamp: s.CreatedAt.Format("2006-01-02T15:04:05Z"),
			})
		}
	}

	// Recent cold emails
	emails, err := h.queries.ListColdEmailsByUser(ctx, db.ListColdEmailsByUserParams{
		UserID: user.ID,
		Limit:  5,
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

	// Recent job applications
	apps, err := h.queries.ListJobApplicationsByUser(ctx, db.ListJobApplicationsByUserParams{
		UserID: user.ID,
		Limit:  5,
		Offset: 0,
	})
	if err == nil {
		for _, a := range apps {
			items = append(items, activityItem{
				Type:      "job_application",
				Title:     a.JobTitle + " at " + a.CompanyName,
				Subtitle:  "Status: " + a.Status,
				Timestamp: a.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			})
		}
	}

	// Sort by timestamp descending (simple bubble sort for small list)
	for i := 0; i < len(items); i++ {
		for j := i + 1; j < len(items); j++ {
			if items[j].Timestamp > items[i].Timestamp {
				items[i], items[j] = items[j], items[i]
			}
		}
	}

	// Cap at 15 items
	if len(items) > 15 {
		items = items[:15]
	}

	respond.JSON(w, http.StatusOK, items)
}

