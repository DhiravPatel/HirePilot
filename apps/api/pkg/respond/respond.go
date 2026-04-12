package respond

import (
	"encoding/json"
	"net/http"
)

func JSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			http.Error(w, `{"error":"failed to encode response"}`, http.StatusInternalServerError)
		}
	}
}

func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, map[string]string{"error": msg})
}

func ValidationError(w http.ResponseWriter, errors map[string]string) {
	JSON(w, http.StatusUnprocessableEntity, map[string]any{
		"error":   "validation failed",
		"details": errors,
	})
}
