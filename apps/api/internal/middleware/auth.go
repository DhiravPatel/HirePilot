package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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
			// Auto-create user from verified JWT claims. The JWT was signed with
			// NEXTAUTH_SECRET so we trust the email is real.
			var namePtr *string
			if name, ok := claims["name"].(string); ok && name != "" {
				namePtr = &name
			}
			var imagePtr *string
			if image, ok := claims["picture"].(string); ok && image != "" {
				imagePtr = &image
			}

			user, err = m.queries.CreateUser(r.Context(), db.CreateUserParams{
				ID:       uuid.New().String(),
				Email:    email,
				Name:     namePtr,
				Image:    imagePtr,
				GoogleID: nil,
			})
			if err != nil {
				log.Printf("auth: failed to create user %s: %v", email, err)
				http.Error(w, `{"error":"failed to create user"}`, http.StatusInternalServerError)
				return
			}
			log.Printf("auth: auto-created user %s", email)
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
