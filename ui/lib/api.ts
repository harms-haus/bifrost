import type {
  SessionInfo,
  LoginRequest,
  LoginResponse,
  OnboardingCheckResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  MyStatsResponse,
  RuneListItem,
  RuneDetail,
  CreateRuneRequest,
  UpdateRuneRequest,
  RuneFilters,
  AddDependencyRequest,
  RemoveDependencyRequest,
  AddNoteRequest,
  RealmListEntry,
  RealmDetail,
  CreateRealmRequest,
  AssignRoleRequest,
  SuspendRealmRequest,
  RevokeRoleRequest,
  RevokeRoleRequest,
  AccountListEntry,
  AccountDetail,
  CreateAccountRequest,
  SuspendAccountRequest,
  GrantRealmRequest,
  RevokeRealmRequest,
  CreatePatRequest,
  RevokePatRequest,
  PatEntry,
} from "@/types";

/**
 * Custom error class for API errors.
 * Captures HTTP status code and response message.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Configuration options for the API client.
 */
export interface ApiClientOptions {
  baseUrl?: string;
}

/**
 * API client for communicating with the Bifrost Go backend.
 * Handles authentication via HTTP-only cookies and realm context.
 */
export class ApiClient {
  private baseUrl: string;
  private currentRealm: string | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "";
  }

  /**
   * Set the current realm for subsequent requests.
   * The realm ID will be included in the X-Bifrost-Realm header.
   */
  setRealm(realm: string | null): void {
    this.currentRealm = realm;
  }

  /**
   * Get the current realm ID.
   */
  getCurrentRealm(): string | null {
    return this.currentRealm;
  }

  /**
   * Make a fetch request with proper headers and error handling.
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const base =
      this.baseUrl ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");
    const url = new URL(path, base);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add realm header if set
    if (this.currentRealm) {
      headers["X-Bifrost-Realm"] = this.currentRealm;
    }

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
        credentials: "include", // Include HTTP-only cookies
      });

      if (!response.ok) {
        const text = await response.text();
        throw new ApiError(response.status, text || response.statusText);
      }

      // Handle empty responses (e.g., 204 No Content)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return undefined as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Wrap network errors
      throw new ApiError(0, error instanceof Error ? error.message : "Network error");
    }
  }

  // ============================================
  // Auth endpoints
  // ============================================

  /**
   * Login with a PAT (Personal Access Token).
   */
  async login(pat: string): Promise<LoginResponse> {
    const body: LoginRequest = { pat };
    return this.request<LoginResponse>("/ui/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Logout and clear session.
   */
  async logout(): Promise<void> {
    return this.request<void>("/ui/logout", { method: "POST" });
  }

  /**
   * Get current session info.
   */
  async getSession(): Promise<SessionInfo> {
    return this.request<SessionInfo>("/ui/session");
  }

  // ============================================
  // Rune endpoints
  // ============================================

  /**
   * Get list of runes with optional filters.
   */
  async getRunes(filters?: RuneFilters): Promise<RuneListItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.priority !== undefined) params.set("priority", String(filters.priority));
    if (filters?.assignee) params.set("assignee", filters.assignee);
    if (filters?.branch) params.set("branch", filters.branch);
    if (filters?.blocked !== undefined) params.set("blocked", String(filters.blocked));
    if (filters?.is_saga !== undefined) params.set("is_saga", String(filters.is_saga));

    const query = params.toString();
    return this.request<RuneListItem[]>(`/runes${query ? `?${query}` : ""}`);
  }

  /**
   * Get a single rune by ID.
   */
  async getRune(id: string): Promise<RuneDetail> {
    return this.request<RuneDetail>(`/rune?id=${encodeURIComponent(id)}`);
  }

  /**
   * Create a new rune.
   */
  async createRune(data: CreateRuneRequest): Promise<RuneDetail> {
    return this.request<RuneDetail>("/create-rune", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing rune.
   */
  async updateRune(data: UpdateRuneRequest): Promise<RuneDetail> {
    return this.request<RuneDetail>("/update-rune", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Forge a rune (move from draft to open).
   */
  async forgeRune(id: string): Promise<void> {
    return this.request<void>("/forge-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Claim a rune.
   */
  async claimRune(id: string): Promise<void> {
    return this.request<void>("/claim-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Unclaim a rune.
   */
  async unclaimRune(id: string): Promise<void> {
    return this.request<void>("/unclaim-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Fulfill a rune.
   */
  async fulfillRune(id: string): Promise<void> {
    return this.request<void>("/fulfill-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Seal a rune.
   */
  async sealRune(id: string): Promise<void> {
    return this.request<void>("/seal-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Shatter a rune.
   */
  async shatterRune(id: string): Promise<void> {
    return this.request<void>("/shatter-rune", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Sweep (batch shatter) completed runes.
   */
  async sweepRunes(): Promise<void> {
    return this.request<void>("/sweep-runes", { method: "POST" });
  }

  /**
   * Add a dependency between runes.
   */
  async addDependency(data: AddDependencyRequest): Promise<void> {
    return this.request<void>("/add-dependency", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Remove a dependency between runes.
   */
  async removeDependency(data: RemoveDependencyRequest): Promise<void> {
    return this.request<void>("/remove-dependency", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Add a note to a rune.
   */
  async addNote(data: AddNoteRequest): Promise<void> {
    return this.request<void>("/add-note", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Realm endpoints
  // ============================================

  /**
   * Get list of all realms (SysAdmin only).
   */
  async getRealms(): Promise<RealmListEntry[]> {
    return this.request<RealmListEntry[]>("/realms");
  }

  /**
   * Get a single realm by ID.
   */
  async getRealm(id: string): Promise<RealmDetail> {
    return this.request<RealmDetail>(`/realm?id=${encodeURIComponent(id)}`);
  }

  /**
   * Create a new realm.
   */
  async createRealm(data: CreateRealmRequest): Promise<RealmDetail> {
    return this.request<RealmDetail>("/create-realm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Assign a role to an account in a realm.
   */
  async assignRole(data: AssignRoleRequest): Promise<void> {
    return this.request<void>("/assign-role", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Revoke a role from an account in a realm.
   */
  async revokeRole(data: RevokeRoleRequest): Promise<void> {
    return this.request<void>("/revoke-role", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Suspend a realm.
   */
  async suspendRealm(data: SuspendRealmRequest): Promise<void> {
    return this.request<void>("/suspend-realm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Account endpoints (SysAdmin)
  // ============================================

  /**
   * Get list of all accounts.
   */
  async getAccounts(): Promise<AccountListEntry[]> {
    return this.request<AccountListEntry[]>("/accounts");
  }

  /**
   * Get a single account by ID.
   */
  async getAccount(id: string): Promise<AccountDetail> {
    return this.request<AccountDetail>(`/account?id=${encodeURIComponent(id)}`);
  }

  /**
   * Create a new account.
   */
  async createAccount(data: CreateAccountRequest): Promise<AccountDetail> {
    return this.request<AccountDetail>("/create-account", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Suspend an account.
   */
  async suspendAccount(data: SuspendAccountRequest): Promise<void> {
    return this.request<void>("/suspend-account", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Grant an account access to a realm.
   */
  async grantRealm(data: GrantRealmRequest): Promise<void> {
    return this.request<void>("/grant-realm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Revoke an account's access to a realm.
   */
  async revokeRealm(data: RevokeRealmRequest): Promise<void> {
    return this.request<void>("/revoke-realm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Create a PAT for an account.
   */
  async createPat(data: CreatePatRequest): Promise<{ pat: string }> {
    return this.request<{ pat: string }>("/create-pat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Revoke a PAT.
   */
  async revokePat(data: RevokePatRequest): Promise<void> {
    return this.request<void>("/revoke-pat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get list of PATs for current account.
   */
  async getPats(): Promise<PatEntry[]> {
    return this.request<PatEntry[]>("/pats");
  }

  // ============================================
  // Misc endpoints
  // ============================================

  /**
   * Check if system needs onboarding.
   */
  async checkOnboarding(): Promise<OnboardingCheckResponse> {
    return this.request<OnboardingCheckResponse>("/ui/check-onboarding");
  }

  /**
   * Create first admin account (onboarding).
   */
  async createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    return this.request<CreateAdminResponse>("/ui/onboarding/create-admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get stats for current account.
   */
  async getMyStats(): Promise<MyStatsResponse> {
    return this.request<MyStatsResponse>("/my-stats");
  }
}

// Default instance for convenience
export const api = new ApiClient();
