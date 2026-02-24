// Session info from /ui/session
export interface SessionInfo {
  account_id: string;
  username: string;
  realms: string[];
  roles: Record<string, string>; // realm_id -> role
  current_realm?: string;
  is_sysadmin: boolean;
}

// Login request
export interface LoginRequest {
  pat: string;
}

// Login response
export interface LoginResponse extends SessionInfo {}

// Onboarding check response
export interface OnboardingCheckResponse {
  needs_onboarding: boolean;
}

// Create admin request (onboarding)
export interface CreateAdminRequest {
  username: string;
  realm_name: string;
}

// Create admin response
export interface CreateAdminResponse {
  account_id: string;
  pat: string; // Initial PAT, shown once
  realm_id: string;
}

// My stats response
export interface MyStatsResponse {
  total_runes: number;
  open_assigned: number;
  fulfilled_this_week: number;
  fulfilled_this_month: number;
  blocked_count: number;
}
