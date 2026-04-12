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
	"github.com/yourusername/hirepilot/api/pkg/appwrite"
	pdfpkg "github.com/yourusername/hirepilot/api/pkg/pdf"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type AtsHandler struct {
	queries       *db.Queries
	atsService    *service.ATSService
	storageClient *appwrite.Client
}

func NewAtsHandler(queries *db.Queries, atsService *service.ATSService, storageClient *appwrite.Client) *AtsHandler {
	return &AtsHandler{queries: queries, atsService: atsService, storageClient: storageClient}
}

type atsScanRequest struct {
	ResumeID       string `json:"resumeId"`
	ResumeText     string `json:"resumeText"`
	JobTitle       string `json:"jobTitle"`
	JobDescription string `json:"jobDescription"`
}

func (h *AtsHandler) Scan(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	var req atsScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resumeText := req.ResumeText
	var resumeID *string

	if req.ResumeID != "" {
		resume, err := h.queries.GetResume(r.Context(), db.GetResumeParams{
			ID:     req.ResumeID,
			UserID: user.ID,
		})
		if err != nil {
			respond.Error(w, http.StatusNotFound, "resume not found")
			return
		}

		content, err := h.storageClient.DownloadFile(r.Context(), resume.FileID)
		if err != nil {
			respond.Error(w, http.StatusInternalServerError, "failed to download resume")
			return
		}

		extracted, err := pdfpkg.ExtractText(content)
		if err != nil {
			respond.Error(w, http.StatusUnprocessableEntity, "failed to extract text from PDF")
			return
		}

		resumeText = extracted
		resumeID = &req.ResumeID
	}

	if resumeText == "" {
		respond.Error(w, http.StatusBadRequest, "either resumeId or resumeText is required")
		return
	}

	result, rawFeedback, err := h.atsService.ScanResume(r.Context(), resumeText, req.JobTitle, req.JobDescription)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "ATS scan failed")
		return
	}

	var jobTitle *string
	if req.JobTitle != "" {
		jobTitle = &req.JobTitle
	}
	var jobDescription *string
	if req.JobDescription != "" {
		jobDescription = &req.JobDescription
	}

	scan, err := h.queries.CreateAtsScan(r.Context(), db.CreateAtsScanParams{
		ID:               uuid.New().String(),
		UserID:           user.ID,
		ResumeID:         resumeID,
		JobTitle:         jobTitle,
		JobDescription:   jobDescription,
		OverallScore:     int32(result.OverallScore),
		FormattingScore:  int32(result.FormattingScore),
		KeywordsScore:    int32(result.KeywordsScore),
		ExperienceScore:  int32(result.ExperienceScore),
		EducationScore:   int32(result.EducationScore),
		SkillsScore:      int32(result.SkillsScore),
		ReadabilityScore: int32(result.ReadabilityScore),
		Strengths:        result.Strengths,
		Weaknesses:       result.Weaknesses,
		Suggestions:      result.Suggestions,
		MissingKeywords:  result.MissingKeywords,
		MatchedKeywords:  result.MatchedKeywords,
		RawFeedback:      rawFeedback,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to save scan results")
		return
	}

	respond.JSON(w, http.StatusCreated, scan)
}

func (h *AtsHandler) List(w http.ResponseWriter, r *http.Request) {
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

	scans, err := h.queries.ListAtsScansByUser(r.Context(), db.ListAtsScansByUserParams{
		UserID: user.ID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to list scans")
		return
	}

	respond.JSON(w, http.StatusOK, scans)
}

func (h *AtsHandler) Get(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	scan, err := h.queries.GetAtsScan(r.Context(), db.GetAtsScanParams{ID: id, UserID: user.ID})
	if err != nil {
		respond.Error(w, http.StatusNotFound, "scan not found")
		return
	}

	respond.JSON(w, http.StatusOK, scan)
}

func (h *AtsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	if err := h.queries.DeleteAtsScan(r.Context(), db.DeleteAtsScanParams{ID: id, UserID: user.ID}); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to delete scan")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "scan deleted"})
}
