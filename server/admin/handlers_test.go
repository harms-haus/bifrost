package admin

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/devzeebo/bifrost/domain/projectors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoginHandler_Get(t *testing.T) {
	templates, err := NewTemplates()
	require.NoError(t, err)

	cfg := DefaultAuthConfig()
	cfg.SigningKey = make([]byte, 32)
	rand.Read(cfg.SigningKey)

	handlers := NewHandlers(templates, cfg, nil)

	req := httptest.NewRequest("GET", "/admin/login", nil)
	rec := httptest.NewRecorder()

	handlers.LoginHandler(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "Bifrost Admin")
	assert.Contains(t, rec.Body.String(), "Personal Access Token")
	assert.Contains(t, rec.Header().Get("Content-Type"), "text/html")
}

func TestLoginHandler_Post(t *testing.T) {
	templates, err := NewTemplates()
	require.NoError(t, err)

	cfg := DefaultAuthConfig()
	cfg.SigningKey = make([]byte, 32)
	rand.Read(cfg.SigningKey)

	t.Run("valid PAT - successful login", func(t *testing.T) {
		store := newMockProjectionStore()

		// Create a valid PAT
		rawKey := make([]byte, 32)
		rand.Read(rawKey)
		pat := base64.RawURLEncoding.EncodeToString(rawKey)
		h := sha256.Sum256(rawKey)
		keyHash := base64.RawURLEncoding.EncodeToString(h[:])

		store.data[keyHash] = projectors.AccountLookupEntry{
			AccountID: "account-123",
			Username:  "testuser",
			Status:    "active",
			Roles:     map[string]string{"realm-1": "member"},
		}
		store.data["keyhash_pat:"+keyHash] = "pat-456"

		handlers := NewHandlers(templates, cfg, store)

		form := url.Values{}
		form.Set("pat", pat)
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		// Should redirect to /admin/
		assert.Equal(t, http.StatusSeeOther, rec.Code)
		assert.Equal(t, "/admin/", rec.Header().Get("Location"))

		// Should set cookie
		cookies := rec.Result().Cookies()
		var authCookie *http.Cookie
		for _, c := range cookies {
			if c.Name == "admin_token" {
				authCookie = c
				break
			}
		}
		require.NotNil(t, authCookie)
		assert.NotEmpty(t, authCookie.Value)
		assert.True(t, authCookie.HttpOnly)
	})

	t.Run("empty PAT - shows error", func(t *testing.T) {
		store := newMockProjectionStore()
		handlers := NewHandlers(templates, cfg, store)

		form := url.Values{}
		form.Set("pat", "")
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "PAT is required")
	})

	t.Run("whitespace-only PAT - shows error", func(t *testing.T) {
		store := newMockProjectionStore()
		handlers := NewHandlers(templates, cfg, store)

		form := url.Values{}
		form.Set("pat", "   ")
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "PAT is required")
	})

	t.Run("invalid PAT format - shows error", func(t *testing.T) {
		store := newMockProjectionStore()
		handlers := NewHandlers(templates, cfg, store)

		form := url.Values{}
		form.Set("pat", "!!!invalid-base64!!!")
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "PAT not found or expired")
	})

	t.Run("PAT not found - shows error", func(t *testing.T) {
		store := newMockProjectionStore()
		handlers := NewHandlers(templates, cfg, store)

		// Create a PAT that doesn't exist in the store
		rawKey := make([]byte, 32)
		rand.Read(rawKey)
		pat := base64.RawURLEncoding.EncodeToString(rawKey)

		form := url.Values{}
		form.Set("pat", pat)
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "PAT not found or expired")
	})

	t.Run("suspended account - shows error", func(t *testing.T) {
		store := newMockProjectionStore()

		rawKey := make([]byte, 32)
		rand.Read(rawKey)
		pat := base64.RawURLEncoding.EncodeToString(rawKey)
		h := sha256.Sum256(rawKey)
		keyHash := base64.RawURLEncoding.EncodeToString(h[:])

		store.data[keyHash] = projectors.AccountLookupEntry{
			AccountID: "account-123",
			Username:  "testuser",
			Status:    "suspended",
		}

		handlers := NewHandlers(templates, cfg, store)

		form := url.Values{}
		form.Set("pat", pat)
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()

		handlers.LoginHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Account is suspended")
	})
}

func TestLogoutHandler(t *testing.T) {
	templates, err := NewTemplates()
	require.NoError(t, err)

	cfg := DefaultAuthConfig()
	cfg.SigningKey = make([]byte, 32)
	rand.Read(cfg.SigningKey)

	handlers := NewHandlers(templates, cfg, nil)

	t.Run("POST logout - clears cookie and redirects", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/admin/logout", nil)
		rec := httptest.NewRecorder()

		handlers.LogoutHandler(rec, req)

		assert.Equal(t, http.StatusSeeOther, rec.Code)
		assert.Equal(t, "/admin/login", rec.Header().Get("Location"))

		// Check cookie is cleared
		cookies := rec.Result().Cookies()
		var authCookie *http.Cookie
		for _, c := range cookies {
			if c.Name == "admin_token" {
				authCookie = c
				break
			}
		}
		require.NotNil(t, authCookie)
		assert.Equal(t, "", authCookie.Value)
		assert.Equal(t, -1, authCookie.MaxAge)
	})

	t.Run("GET logout - method not allowed", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/logout", nil)
		rec := httptest.NewRecorder()

		handlers.LogoutHandler(rec, req)

		assert.Equal(t, http.StatusMethodNotAllowed, rec.Code)
	})
}

func TestGetLoginErrorMessage(t *testing.T) {
	handlers := &Handlers{}

	tests := []struct {
		err      error
		expected string
	}{
		{ErrInvalidToken, "PAT not found or expired"},
		{ErrPATRevoked, "PAT has been revoked"},
		{ErrAccountSuspended, "Account is suspended"},
		{errors.New("unknown error"), "Authentication failed"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			msg := handlers.getLoginErrorMessage(tt.err)
			assert.Equal(t, tt.expected, msg)
		})
	}
}

func TestRegisterRoutes(t *testing.T) {
	templates, err := NewTemplates()
	require.NoError(t, err)

	cfg := DefaultAuthConfig()
	cfg.SigningKey = make([]byte, 32)
	rand.Read(cfg.SigningKey)

	store := newMockProjectionStore()
	handlers := NewHandlers(templates, cfg, store)

	publicMux := http.NewServeMux()
	authMux := http.NewServeMux()
	handlers.RegisterRoutes(publicMux, authMux)

	// Test public routes
	t.Run("GET /admin/login is public", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/login", nil)
		rec := httptest.NewRecorder()
		publicMux.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("POST /admin/login is public", func(t *testing.T) {
		form := url.Values{}
		form.Set("pat", "test")
		req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()
		publicMux.ServeHTTP(rec, req)
		assert.NotEqual(t, http.StatusNotFound, rec.Code)
	})

	// Test authenticated routes
	t.Run("POST /admin/logout requires auth", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/admin/logout", nil)
		rec := httptest.NewRecorder()
		authMux.ServeHTTP(rec, req)
		assert.NotEqual(t, http.StatusNotFound, rec.Code)
	})

	t.Run("GET /admin/ requires auth", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/", nil)
		rec := httptest.NewRecorder()
		authMux.ServeHTTP(rec, req)
		assert.NotEqual(t, http.StatusNotFound, rec.Code)
	})
}

func TestDashboardHandler(t *testing.T) {
	templates, err := NewTemplates()
	require.NoError(t, err)

	cfg := DefaultAuthConfig()
	cfg.SigningKey = make([]byte, 32)
	rand.Read(cfg.SigningKey)

	handlers := NewHandlers(templates, cfg, nil)

	t.Run("shows username in dashboard", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/", nil)
		ctx := contextWithUsername(req.Context(), "testuser")
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		handlers.DashboardHandler(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "testuser")
	})
}

// Helper to create context with username
func contextWithUsername(ctx context.Context, username string) context.Context {
	return context.WithValue(ctx, usernameKey, username)
}
