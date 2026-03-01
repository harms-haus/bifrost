export interface SessionInfo {
  account_id: string;
  username: string;
  realms: string[];
  roles: Record<string, string>;
  is_admin: boolean;
  realm_names?: Record<string, string>;
}


export interface LoginRequest {
  pat: string;
}

export type OnboardingCheckResponse = {
  needs_onboarding: boolean;
};

export type CreateAdminRequest = {
  username: string;
  realm_name: string;
};

export type CreateAdminResponse = {
  account_id: string;
  pat: string;
  realm_id: string;
};
