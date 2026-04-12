package handler

import (
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/pkg/appwrite"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type ResumeHandler struct {
	queries       *db.Queries
	storageClient *appwrite.Client
}

func NewResumeHandler(queries *db.Queries, storageClient *appwrite.Client) *ResumeHandler {
	return &ResumeHandler{queries: queries, storageClient: storageClient}
}

func (h *ResumeHandler) Upload(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	// Limit upload size to 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respond.Error(w, http.StatusBadRequest, "file too large or invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		respond.Error(w, http.StatusBadRequest, "file field is required")
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to read file")
		return
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/pdf"
	}

	name := r.FormValue("name")
	if name == "" {
		name = header.Filename
	}

	fileID := uuid.New().String()

	uploaded, err := h.storageClient.UploadFile(r.Context(), fileID, header.Filename, content, mimeType)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to upload file to storage")
		return
	}

	fileURL := h.storageClient.GetFileURL(uploaded.ID)

	resume, err := h.queries.CreateResume(r.Context(), db.CreateResumeParams{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		Name:         name,
		FileID:       uploaded.ID,
		FileURL:      fileURL,
		OriginalName: header.Filename,
		FileSize:     int32(len(content)),
		MimeType:     mimeType,
		IsDefault:    false,
	})
	if err != nil {
		// Try to clean up the uploaded file
		_ = h.storageClient.DeleteFile(r.Context(), uploaded.ID)
		respond.Error(w, http.StatusInternalServerError, "failed to save resume record")
		return
	}

	respond.JSON(w, http.StatusCreated, resume)
}

func (h *ResumeHandler) List(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)

	resumes, err := h.queries.ListResumesByUser(r.Context(), user.ID)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to list resumes")
		return
	}

	respond.JSON(w, http.StatusOK, resumes)
}

func (h *ResumeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	resume, err := h.queries.GetResume(r.Context(), db.GetResumeParams{ID: id, UserID: user.ID})
	if err != nil {
		respond.Error(w, http.StatusNotFound, "resume not found")
		return
	}

	// Delete from storage
	_ = h.storageClient.DeleteFile(r.Context(), resume.FileID)

	if err := h.queries.DeleteResume(r.Context(), db.DeleteResumeParams{ID: id, UserID: user.ID}); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to delete resume")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "resume deleted"})
}

func (h *ResumeHandler) SetDefault(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(db.User)
	id := chi.URLParam(r, "id")

	// Verify resume exists
	_, err := h.queries.GetResume(r.Context(), db.GetResumeParams{ID: id, UserID: user.ID})
	if err != nil {
		respond.Error(w, http.StatusNotFound, "resume not found")
		return
	}

	// Unset all defaults first
	if err := h.queries.UnsetDefaultResumes(r.Context(), user.ID); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to update default resume")
		return
	}

	// Set new default
	if err := h.queries.SetDefaultResume(r.Context(), db.SetDefaultResumeParams{ID: id, UserID: user.ID}); err != nil {
		respond.Error(w, http.StatusInternalServerError, "failed to set default resume")
		return
	}

	respond.JSON(w, http.StatusOK, map[string]string{"message": "default resume updated"})
}
