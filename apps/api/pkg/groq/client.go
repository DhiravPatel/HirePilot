package groq

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	baseURL       = "https://api.groq.com/openai/v1/chat/completions"
	ModelLlama70B = "llama3-70b-8192"
	ModelMixtral  = "mixtral-8x7b-32768"
)

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 60 * time.Second},
	}
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type request struct {
	Model          string            `json:"model"`
	Messages       []Message         `json:"messages"`
	Temperature    float64           `json:"temperature"`
	MaxTokens      int               `json:"max_tokens"`
	ResponseFormat map[string]string `json:"response_format"`
}

type response struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// Complete sends a system + user prompt and returns the raw JSON string from Groq.
func (c *Client) Complete(ctx context.Context, system, user string) (string, error) {
	body := request{
		Model: ModelLlama70B,
		Messages: []Message{
			{Role: "system", Content: system},
			{Role: "user", Content: user},
		},
		Temperature:    0.4,
		MaxTokens:      4096,
		ResponseFormat: map[string]string{"type": "json_object"},
	}

	b, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL, bytes.NewReader(b))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var gr response
	if err := json.Unmarshal(raw, &gr); err != nil {
		return "", err
	}
	if gr.Error != nil {
		return "", fmt.Errorf("groq: %s", gr.Error.Message)
	}
	if len(gr.Choices) == 0 {
		return "", fmt.Errorf("groq: empty response")
	}

	return gr.Choices[0].Message.Content, nil
}

// CompleteJSON is a generic helper that unmarshals the Groq JSON response into T.
func CompleteJSON[T any](ctx context.Context, c *Client, system, user string) (T, error) {
	var zero T
	raw, err := c.Complete(ctx, system, user)
	if err != nil {
		return zero, err
	}
	var result T
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return zero, fmt.Errorf("groq: failed to parse response: %w", err)
	}
	return result, nil
}
