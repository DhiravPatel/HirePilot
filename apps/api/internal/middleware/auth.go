package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yourusername/hirepilot/api/internal/db"
)

type contextKey string

const UserContextKey contextKey = "user"

type AuthMiddleware struct {
	secret  string
	queries *db.Queries
}

func NewAuthMiddleware(nextAuthSecret string, queries *db.Queries) *AuthMiddleware {
	return &AuthMiddleware{secret: nextAuthSecret, queries: queries}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(m.secret), nil
		})
		if err != nil || !token.Valid {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, `{"error":"invalid claims"}`, http.StatusUnauthorized)
			return
		}

		email, _ := claims["email"].(string)
		if email == "" {
			http.Error(w, `{"error":"missing email in token"}`, http.StatusUnauthorized)
			return
		}

		user, err := m.queries.GetUserByEmail(r.Context(), email)
		if err != nil {
			http.Error(w, `{"error":"user not found"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
