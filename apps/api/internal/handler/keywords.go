package handler

import (
	"encoding/json"
	"net/http"

	"github.com/yourusername/hirepilot/api/internal/service"
	"github.com/yourusername/hirepilot/api/pkg/respond"
)

type KeywordHandler struct {
	keywordService *service.KeywordService
}

func NewKeywordHandler(keywordService *service.KeywordService) *KeywordHandler {
	return &KeywordHandler{keywordService: keywordService}
}

type optimizeRequest struct {
	TargetRole      string `json:"targetRole"`
	Industry        string `json:"industry"`
	ExperienceLevel string `json:"experienceLevel"`
}

func (h *KeywordHandler) Optimize(w http.ResponseWriter, r *http.Request) {
	var req optimizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TargetRole == "" {
		respond.Error(w, http.StatusBadRequest, "targetRole is required")
		return
	}

	result, err := h.keywordService.Optimize(r.Context(), req.TargetRole, req.Industry, req.ExperienceLevel)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "keyword optimization failed")
		return
	}

	respond.JSON(w, http.StatusOK, result)
}

type checkRequest struct {
	ResumeText     string   `json:"resumeText"`
	TargetKeywords []string `json:"targetKeywords"`
}

func (h *KeywordHandler) Check(w http.ResponseWriter, r *http.Request) {
	var req checkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ResumeText == "" {
		respond.Error(w, http.StatusBadRequest, "resumeText is required")
		return
	}
	if len(req.TargetKeywords) == 0 {
		respond.Error(w, http.StatusBadRequest, "targetKeywords is required")
		return
	}

	result, err := h.keywordService.Check(r.Context(), req.ResumeText, req.TargetKeywords)
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, "keyword check failed")
		return
	}

	respond.JSON(w, http.StatusOK, result)
}
