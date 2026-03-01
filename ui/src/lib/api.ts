import type {
  SessionInfo,
  LoginRequest,
  OnboardingCheckResponse,
  CreateAdminRequest,
  CreateAdminResponse,
} from "../types/session";
import type { RuneListItem, RuneDetail, CreateRuneRequest } from "../types/rune";
import type { RealmListEntry, RealmDetail, CreateRealmRequest } from "../types/realm";
import type { AccountListEntry, AdminAccountEntry, PatEntry } from "../types/account";

const API_PREFIX = "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }
      throw new ApiError(
        response.status,
        `Request failed: ${response.statusText}`,
        data
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Session / Auth
  async login(request: LoginRequest): Promise<SessionInfo> {
    return this.request<SessionInfo>("/auth/login", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async logout(): Promise<void> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getSession(): Promise<SessionInfo | null> {
    return this.request<SessionInfo | null>("/auth/session", {
      method: "GET",
    });
  }

  async checkOnboarding(): Promise<OnboardingCheckResponse> {
    return this.request<OnboardingCheckResponse>("/ui/check-onboarding", {
      method: "GET",
    });
  }

  // Onboarding
  async createAdmin(request: CreateAdminRequest): Promise<CreateAdminResponse> {
    return this.request<CreateAdminResponse>("/ui/onboarding/create-admin", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Runes
  async getRunes(realmId: string): Promise<RuneListItem[]> {
    return this.request<RuneListItem[]>(`/realms/${realmId}/runes`, {
      method: "GET",
    });
  }

  async getRune(realmId: string, runeId: string): Promise<RuneDetail> {
    return this.request<RuneDetail>(`/realms/${realmId}/runes/${runeId}`, {
      method: "GET",
    });
  }

  async createRune(request: CreateRuneRequest): Promise<RuneDetail> {
    return this.request<RuneDetail>("/runes", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateRune(
    realmId: string,
    runeId: string,
    updates: Partial<RuneDetail>
  ): Promise<RuneDetail> {
    return this.request<RuneDetail>(`/realms/${realmId}/runes/${runeId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteRune(realmId: string, runeId: string): Promise<void> {
    return this.request(`/realms/${realmId}/runes/${runeId}`, {
      method: "DELETE",
    });
  }

  // Realms
  async getRealms(): Promise<RealmListEntry[]> {
    return this.request<RealmListEntry[]>("/realms", {
      method: "GET",
    });
  }

  async getRealm(realmId: string): Promise<RealmDetail> {
    return this.request<RealmDetail>(`/realms/${realmId}`, {
      method: "GET",
    });
  }

  async createRealm(request: CreateRealmRequest): Promise<RealmDetail> {
    return this.request<RealmDetail>("/realms", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Accounts
  async getAccounts(realmId: string): Promise<AccountListEntry[]> {
    return this.request<AccountListEntry[]>(`/realms/${realmId}/accounts`, {
      method: "GET",
    });
  }

  async getAccount(realmId: string, accountId: string): Promise<AccountListEntry> {
    return this.request<AccountListEntry>(
      `/realms/${realmId}/accounts/${accountId}`,
      {
        method: "GET",
      }
    );
  }

  async createAccount(
    realmId: string,
    request: { username: string }
  ): Promise<AccountListEntry> {
    return this.request<AccountListEntry>(`/realms/${realmId}/accounts`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Admin Accounts (sysadmin only)
  async getAdminAccounts(): Promise<AdminAccountEntry[]> {
    return this.request<AdminAccountEntry[]>("/accounts", {
      method: "GET",
    });
  }


  async createAdminAccount(username: string): Promise<{ account_id: string; pat: string }> {
    return this.request<{ account_id: string; pat: string }>("/create-account", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  }

  // PAT Management (admin only)
  async createPAT(accountId: string): Promise<{ pat: string }> {
    return this.request<{ pat: string }>("/create-pat", {
      method: "POST",
      body: JSON.stringify({ account_id: accountId }),
    });
  }

  async getPATs(accountId: string): Promise<PatEntry[]> {
    return this.request<PatEntry[]>(`/pats?account_id=${accountId}`, {
      method: "GET",
    });
  }

  async revokePAT(accountId: string, patId: string): Promise<void> {
    return this.request("/revoke-pat", {
      method: "POST",
      body: JSON.stringify({ account_id: accountId, pat_id: patId }),
    });
  }
}

export const api = new ApiClient();
