// Account status
export type AccountStatus = "active" | "suspended";

// Account list entry
export interface AccountListEntry {
  account_id: string;
  username: string;
  status: AccountStatus;
  realms: string[];
  roles: Record<string, string>; // realm_id -> role
  pat_count: number;
  created_at: string;
}

// Account detail
export interface AccountDetail extends AccountListEntry {
  email?: string;
}

// Create account request
export interface CreateAccountRequest {
  username: string;
  email?: string;
}

// Suspend account request
export interface SuspendAccountRequest {
  id: string;
}

// Grant realm request
export interface GrantRealmRequest {
  account_id: string;
  realm_id: string;
}

// Revoke realm request
export interface RevokeRealmRequest {
  account_id: string;
  realm_id: string;
}

// Create PAT request
export interface CreatePatRequest {
  account_id: string;
  name?: string;
  expires_at?: string;
}

// Revoke PAT request
export interface RevokePatRequest {
  account_id: string;
  pat_id: string;
}

// PAT entry
export interface PatEntry {
  id: string;
  name?: string;
  prefix: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
}
