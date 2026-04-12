package middleware

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/yourusername/hirepilot/api/internal/db"
	"golang.org/x/time/rate"
)

type RateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
	r        rate.Limit
	b        int
}

func NewRateLimiter(requestsPerSecond float64, burst int) *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
		r:        rate.Limit(requestsPerSecond),
		b:        burst,
	}
}

func (rl *RateLimiter) getLimiter(key string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	if l, ok := rl.limiters[key]; ok {
		return l
	}
	l := rate.NewLimiter(rl.r, rl.b)
	rl.limiters[key] = l
	return l
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.RemoteAddr
		user := r.Context().Value(UserContextKey)
		if user != nil {
			if u, ok := user.(db.User); ok {
				key = fmt.Sprintf("user:%s", u.ID)
			}
		}

		if !rl.getLimiter(key).Allow() {
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}
