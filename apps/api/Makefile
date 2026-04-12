.PHONY: build run dev test clean migrate-up migrate-down sqlc tidy

# Build variables
BINARY_NAME=hirepilot-api
BUILD_DIR=./bin

# Build the API binary
build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server

# Run the built binary
run: build
	$(BUILD_DIR)/$(BINARY_NAME)

# Run the server in development mode
dev:
	go run ./cmd/server

# Run tests
test:
	go test ./... -v

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR)

# Run database migrations up (requires golang-migrate)
migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

# Roll back the last migration
migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

# Generate sqlc code
sqlc:
	sqlc generate

# Tidy go modules
tidy:
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Vet code
vet:
	go vet ./...

# Lint (requires golangci-lint)
lint:
	golangci-lint run
