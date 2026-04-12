package pdf

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/ledongthuc/pdf"
)

func ExtractText(content []byte) (string, error) {
	reader := bytes.NewReader(content)
	r, err := pdf.NewReader(reader, int64(len(content)))
	if err != nil {
		return "", fmt.Errorf("pdf: failed to open: %w", err)
	}

	var sb strings.Builder
	for i := 1; i <= r.NumPage(); i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}
		text, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		sb.WriteString(text)
		sb.WriteString("\n")
	}

	result := strings.TrimSpace(sb.String())
	if result == "" {
		return "", fmt.Errorf("pdf: no text extracted — may be a scanned/image PDF")
	}
	return result, nil
}
