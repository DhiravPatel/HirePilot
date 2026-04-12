package config

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port             string `envconfig:"PORT"                default:"8080"`
	Env              string `envconfig:"ENV"                 default:"development"`
	DatabaseURL      string `envconfig:"DATABASE_URL"        required:"true"`
	GroqAPIKey       string `envconfig:"GROQ_API_KEY"        required:"true"`
	AppwriteEndpoint string `envconfig:"APPWRITE_ENDPOINT"   required:"true"`
	AppwriteProject  string `envconfig:"APPWRITE_PROJECT_ID" required:"true"`
	AppwriteAPIKey   string `envconfig:"APPWRITE_API_KEY"    required:"true"`
	AppwriteBucket   string `envconfig:"APPWRITE_BUCKET_ID"  required:"true"`
	FrontendURL      string `envconfig:"FRONTEND_URL"        default:"http://localhost:3000"`
	JWTSecret        string `envconfig:"JWT_SECRET"          required:"true"`
	NextAuthSecret   string `envconfig:"NEXTAUTH_SECRET"     required:"true"`
}

func Load() *Config {
	_ = godotenv.Load()
	cfg := &Config{}
	if err := envconfig.Process("", cfg); err != nil {
		log.Fatalf("config: failed to process env vars: %v", err)
	}
	return cfg
}
