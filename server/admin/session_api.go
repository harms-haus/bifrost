package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/devzeebo/bifrost/domain"
)

// LoginRequest is the request body for POST /ui/login.
type LoginRequest struct {
	PAT string `json:"pat"`
}

// LoginResponse is the response for successful POST /ui/login.
type LoginResponse struct {
	AccountID string            `json:"account_id"`
	Username  string            `json:"username"`
	Realms    []string          `json:"realms"`
	Roles     map[string]string `json:"roles"`
}

// SessionInfo is the response for GET /ui/session.
type SessionInfo struct {
	AccountID  string            `json:"account_id"`
	Username   string            `json:"username"`
	Realms     []string          `json:"realms"`
	Roles      map[string]string `json:"roles"`
	IsSysAdmin bool              `json:"is_sysadmin"`
}

// OnboardingCheckResponse is the response for GET /ui/check-onboarding.
type OnboardingCheckResponse struct {
	NeedsOnboarding bool `json:"needs_onboarding"`
}

// CreateAdminRequest is the request body for POST /ui/onboarding/create-admin.
type CreateAdminRequest struct {
	Username string `json:"username"`
}

// CreateAdminResponse is the response for POST /ui/onboarding/create-admin.
type CreateAdminResponse struct {
	AccountID string `json:"account_id"`
	PAT       string `json:"pat"`
}

// RegisterSessionAPIRoutes registers the session API routes for the Vike/React UI.
func RegisterSessionAPIRoutes(mux *http.ServeMux, cfg *RouteConfig) {
	mux.HandleFunc("POST /ui/login", handleUILogin(cfg))
	mux.HandleFunc("POST /ui/logout", handleUILogout(cfg))
	mux.HandleFunc("GET /ui/session", handleUISession(cfg))
	mux.HandleFunc("GET /ui/check-onboarding", handleCheckOnboarding(cfg))
	mux.HandleFunc("POST /ui/onboarding/create-admin", handleCreateAdmin(cfg))
}

func handleUILogin(cfg *RouteConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		// Validate PAT is not empty
		pat := strings.TrimSpace(req.PAT)
		if pat == "" {
			http.Error(w, "PAT is required", http.StatusBadRequest)
			return
		}

		// Validate PAT
		entry, patID, err := ValidatePAT(r.Context(), cfg.ProjectionStore, pat)
		if err != nil {
			if errors.Is(err, ErrInvalidToken) || errors.Is(err, ErrPATRevoked) {
				http.Error(w, "invalid or revoked PAT", http.StatusUnauthorized)
				return
			}
			if errors.Is(err, ErrAccountSuspended) {
				http.Error(w, "account suspended", http.StatusUnauthorized)
				return
			}
			http.Error(w, "authentication failed", http.StatusUnauthorized)
			return
		}

		// Generate JWT
		token, err := GenerateJWT(cfg.AuthConfig, entry.AccountID, patID)
		if err != nil {
			http.Error(w, "failed to create session", http.StatusInternalServerError)
			return
		}

		// Set auth cookie with path /ui for Vike UI
		setUIAuthCookie(w, cfg.AuthConfig, token)

		// Return session info
		resp := LoginResponse{
			AccountID: entry.AccountID,
			Username:  entry.Username,
			Realms:    entry.Realms,
			Roles:     entry.Roles,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

func handleUILogout(cfg *RouteConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clearUIAuthCookie(w, cfg.AuthConfig)
		w.WriteHeader(http.StatusOK)
	}
}

func handleUISession(cfg *RouteConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get session cookie
		cookie, err := r.Cookie(cfg.AuthConfig.CookieName)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// Validate JWT
		claims, err := ValidateJWT(cfg.AuthConfig, cookie.Value)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// Check PAT status
		entry, err := CheckPATStatus(r.Context(), cfg.ProjectionStore, claims.PATID)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// Check if sysadmin
		isSysAdmin := false
		if role, ok := entry.Roles["_admin"]; ok {
			isSysAdmin = role == "admin" || role == "owner"
		}

		// Return session info
		resp := SessionInfo{
			AccountID:  entry.AccountID,
			Username:   entry.Username,
			Realms:     entry.Realms,
			Roles:      entry.Roles,
			IsSysAdmin: isSysAdmin,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

func handleCheckOnboarding(cfg *RouteConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		needsOnboarding := true

		// Check if any accounts exist
		if cfg.ProjectionStore != nil {
			accounts, err := cfg.ProjectionStore.List(r.Context(), "_admin", "account_list")
			if err == nil && len(accounts) > 0 {
				needsOnboarding = false
			}
		}

		resp := OnboardingCheckResponse{
			NeedsOnboarding: needsOnboarding,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

func handleCreateAdmin(cfg *RouteConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if onboarding is allowed (no accounts exist)
		if cfg.ProjectionStore != nil {
			accounts, err := cfg.ProjectionStore.List(r.Context(), "_admin", "account_list")
			if err == nil && len(accounts) > 0 {
				http.Error(w, "onboarding already complete", http.StatusBadRequest)
				return
			}
		}

		var req CreateAdminRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		username := strings.TrimSpace(req.Username)
		if username == "" {
			http.Error(w, "username is required", http.StatusBadRequest)
			return
		}

		// Create account via domain command
		result, err := domain.HandleCreateAccount(r.Context(), domain.CreateAccount{
			Username: username,
		}, cfg.EventStore, cfg.ProjectionStore)
		if err != nil {
			http.Error(w, "failed to create account", http.StatusInternalServerError)
			return
		}

		// Grant admin role in _admin realm
		err = domain.HandleAssignRole(r.Context(), domain.AssignRole{
			AccountID: result.AccountID,
			RealmID:   "_admin",
			Role:      "admin",
		}, cfg.EventStore)
		if err != nil {
			http.Error(w, "failed to assign admin role", http.StatusInternalServerError)
			return
		}

		// Return account info with PAT
		resp := CreateAdminResponse{
			AccountID: result.AccountID,
			PAT:       result.RawToken,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

// setUIAuthCookie sets the authentication cookie for the UI (path /ui).
func setUIAuthCookie(w http.ResponseWriter, cfg *AuthConfig, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     cfg.CookieName,
		Value:    token,
		Path:     "/ui",
		MaxAge:   int(cfg.TokenExpiry.Seconds()),
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cfg.CookieSameSite,
	})
}

// clearUIAuthCookie clears the authentication cookie for the UI.
func clearUIAuthCookie(w http.ResponseWriter, cfg *AuthConfig) {
	http.SetCookie(w, &http.Cookie{
		Name:     cfg.CookieName,
		Value:    "",
		Path:     "/ui",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: cfg.CookieSameSite,
	})
}
