package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/yourusername/hirepilot/api/internal/config"
	"github.com/yourusername/hirepilot/api/internal/db"
	"github.com/yourusername/hirepilot/api/internal/handler"
	"github.com/yourusername/hirepilot/api/internal/middleware"
	"github.com/yourusername/hirepilot/api/internal/service"
	appwritepkg "github.com/yourusername/hirepilot/api/pkg/appwrite"
	"github.com/yourusername/hirepilot/api/pkg/groq"
)

func main() {
	cfg := config.Load()

	// Database connection pool. Use simple protocol (no prepared statements)
	// for compatibility with Supabase's transaction pooler (pgbouncer).
	poolCfg, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: invalid DATABASE_URL: %v", err)
	}
	poolCfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		log.Fatalf("db: unable to connect: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("db: ping failed: %v", err)
	}
	log.Println("db: connected")

	// Run migrations automatically on startup
	if err := db.RunMigrations(context.Background(), pool, "migrations"); err != nil {
		log.Fatalf("db: migration failed: %v", err)
	}

	// Init clients
	queries := db.New(pool)
	groqClient := groq.NewClient(cfg.GroqAPIKey)
	storageClient := appwritepkg.NewClient(cfg.AppwriteEndpoint, cfg.AppwriteProject, cfg.AppwriteAPIKey, cfg.AppwriteBucket)

	// Init services
	emailService := service.NewColdEmailService(groqClient)

	// Router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Handlers
	authHandler := handler.NewAuthHandler(queries, cfg)
	userHandler := handler.NewUserHandler(queries)
	resumeHandler := handler.NewResumeHandler(queries, storageClient)
	emailHandler := handler.NewColdEmailHandler(queries, emailService)
	dashboardHandler := handler.NewDashboardHandler(queries)

	// Auth middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.NextAuthSecret, queries)

	// Routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public
		r.Post("/auth/sync-user", authHandler.SyncUser)

		// Protected
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)

			r.Get("/users/me", userHandler.GetMe)
			r.Put("/users/me", userHandler.UpdateMe)
			r.Put("/users/me/onboarding", userHandler.CompleteOnboarding)
			r.Delete("/users/me", userHandler.DeleteMe)

			r.Post("/resumes/upload", resumeHandler.Upload)
			r.Get("/resumes", resumeHandler.List)
			r.Delete("/resumes/{id}", resumeHandler.Delete)
			r.Put("/resumes/{id}/default", resumeHandler.SetDefault)

			r.Post("/cold-email/generate", emailHandler.Generate)
			r.Get("/cold-email", emailHandler.List)
			r.Get("/cold-email/{id}", emailHandler.Get)
			r.Put("/cold-email/{id}", emailHandler.Update)
			r.Delete("/cold-email/{id}", emailHandler.Delete)

			r.Get("/dashboard/stats", dashboardHandler.Stats)
			r.Get("/dashboard/activity", dashboardHandler.Activity)
		})
	})

	// Server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("server: listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("server: shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("server: stopped")
}
