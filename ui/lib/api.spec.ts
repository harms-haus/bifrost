import { describe, expect, vi } from "vitest";
import test from "vitest-gwt";
import { ApiClient, ApiError } from "./api";
import type { LoginResponse, RuneListItem, RuneDetail } from "@/types";

type Context = {
  client: ApiClient;
  mockFetch: ReturnType<typeof vi.fn>;
  baseUrl: string;
  sessionResult?: LoginResponse;
  runeListResult?: RuneListItem[];
  runeDetailResult?: RuneDetail;
};

describe("ApiClient", () => {
  // ============================================
  // Auth endpoints
  // ============================================

  test("logs in with valid PAT", {
    given: {
      client_is_created,
      mock_fetch_resolves_login_response,
    },
    when: {
      async login_is_called(this: Context) {
        await this.client.login("test-pat-123");
      },
    },
    then: {
      fetch_was_called_with_correct_endpoint,
      request_includes_pat_credentials,
    },
  });

  test("logs out successfully", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async logout_is_called(this: Context) {
        await this.client.logout();
      },
    },
    then: {
      fetch_was_called_with_logout_endpoint,
    },
  });

  test("gets current session info", {
    given: {
      client_is_created,
      mock_fetch_resolves_session_data,
    },
    when: {
      async session_is_fetched(this: Context) {
        const result = await this.client.getSession();
        this.sessionResult = result;
      },
    },
    then: {
      fetch_was_called_with_session_endpoint,
      session_data_is_returned,
    },
  });

  // ============================================
  // Realm context
  // ============================================

  test("sets and gets realm context", {
    given: {
      client_is_created,
    },
    when: {
      realm_is_set(this: Context) {
        this.client.setRealm("my-realm-123");
      },
    },
    then: {
      realm_is_returned_when_retrieved,
    },
  });

  test("clears realm context", {
    given: {
      client_is_created,
      realm_is_set(this: Context) {
        this.client.setRealm("my-realm-123");
      },
    },
    when: {
      realm_is_cleared(this: Context) {
        this.client.setRealm(null);
      },
    },
    then: {
      realm_is_null,
    },
  });

  test("realm header is sent with requests", {
    given: {
      client_is_created,
      realm_is_set(this: Context) {
        this.client.setRealm("my-realm-123");
      },
      mock_fetch_resolves_with_204,
    },
    when: {
      async request_is_made(this: Context) {
        await this.client.logout();
      },
    },
    then: {
      realm_header_was_sent,
    },
  });

  // ============================================
  // Rune endpoints
  // ============================================

  test("gets list of runes", {
    given: {
      client_is_created,
      mock_fetch_resolves_rune_list,
    },
    when: {
      async runes_are_fetched(this: Context) {
        const result = await this.client.getRunes();
        this.runeListResult = result;
      },
    },
    then: {
      fetch_was_called_with_runes_endpoint,
      rune_list_is_returned,
    },
  });

  test("gets list of runes with filters", {
    given: {
      client_is_created,
      mock_fetch_resolves_rune_list,
    },
    when: {
      async runes_are_fetched_with_filters(this: Context) {
        const result = await this.client.getRunes({
          status: "open",
          priority: 1,
          assignee: "user123",
        });
        this.runeListResult = result;
      },
    },
    then: {
      fetch_was_called_with_filtered_runes_endpoint,
    },
  });

  test("gets single rune by ID", {
    given: {
      client_is_created,
      mock_fetch_resolves_rune_detail,
    },
    when: {
      async rune_is_fetched_by_id(this: Context) {
        const result = await this.client.getRune("rune-123");
        this.runeDetailResult = result;
      },
    },
    then: {
      fetch_was_called_with_rune_endpoint,
      rune_detail_is_returned,
    },
  });

  test("creates a new rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_rune_detail,
    },
    when: {
      async rune_is_created(this: Context) {
        const result = await this.client.createRune({
          title: "Fix bug",
          description: "Critical bug",
          priority: 1,
        });
        this.runeDetailResult = result;
      },
    },
    then: {
      fetch_was_called_with_create_rune_endpoint,
      rune_data_is_sent_correctly,
    },
  });

  test("updates an existing rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_rune_detail,
    },
    when: {
      async rune_is_updated(this: Context) {
        const result = await this.client.updateRune({
          id: "rune-123",
          title: "Updated title",
        });
        this.runeDetailResult = result;
      },
    },
    then: {
      fetch_was_called_with_update_rune_endpoint,
      update_data_is_sent_correctly,
    },
  });

  test("forges a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_forged(this: Context) {
        await this.client.forgeRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_forge_rune_endpoint,
      rune_id_is_sent_correctly,
    },
  });

  test("claims a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_claimed(this: Context) {
        await this.client.claimRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_claim_rune_endpoint,
    },
  });

  test("unclaims a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_unclaimed(this: Context) {
        await this.client.unclaimRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_unclaim_rune_endpoint,
    },
  });

  test("fulfills a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_fulfilled(this: Context) {
        await this.client.fulfillRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_fulfill_rune_endpoint,
    },
  });

  test("seals a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_sealed(this: Context) {
        await this.client.sealRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_seal_rune_endpoint,
    },
  });

  test("shatters a rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async rune_is_shattered(this: Context) {
        await this.client.shatterRune("rune-123");
      },
    },
    then: {
      fetch_was_called_with_shatter_rune_endpoint,
    },
  });

  test("sweeps completed runes", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async runes_are_swept(this: Context) {
        await this.client.sweepRunes();
      },
    },
    then: {
      fetch_was_called_with_sweep_runes_endpoint,
    },
  });

  test("adds dependency between runes", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async dependency_is_added(this: Context) {
        await this.client.addDependency({
          source_id: "rune-1",
          target_id: "rune-2",
          relationship: "blocked_by",
        });
      },
    },
    then: {
      fetch_was_called_with_add_dependency_endpoint,
    },
  });

  test("removes dependency between runes", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async dependency_is_removed(this: Context) {
        await this.client.removeDependency({
          source_id: "rune-1",
          target_id: "rune-2",
          relationship: "blocked_by",
        });
      },
    },
    then: {
      fetch_was_called_with_remove_dependency_endpoint,
    },
  });

  test("adds note to rune", {
    given: {
      client_is_created,
      mock_fetch_resolves_with_204,
    },
    when: {
      async note_is_added(this: Context) {
        await this.client.addNote({
          id: "rune-123",
          text: "This is a note",
        });
      },
    },
    then: {
      fetch_was_called_with_add_note_endpoint,
    },
  });

  // ============================================
  // Error handling
  // ============================================

  test("throws ApiError on HTTP error response", {
    given: {
      client_is_created,
      mock_fetch_rejects_with_404,
    },
    when: {
      async request_is_made(this: Context) {
        await this.client.getRune("rune-404");
      },
    },
    then: {
      expect_error: api_error_is_thrown,
    },
  });

  test("throws ApiError on network error", {
    given: {
      client_is_created,
      mock_fetch_rejects_with_network_error,
    },
    when: {
      async request_is_made(this: Context) {
        await this.client.getRune("rune-123");
      },
    },
    then: {
      expect_error: api_error_is_thrown,
    },
  });
});

// ============================================
// Given step functions
// ============================================

function client_is_created(this: Context) {
  this.mockFetch = vi.fn();
  global.fetch = this.mockFetch;
  this.baseUrl = "http://localhost:8080";
  this.client = new ApiClient({ baseUrl: this.baseUrl });
}

function mock_fetch_resolves_login_response(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: true,
    headers: { get: vi.fn(() => "application/json") },
    json: async () => ({
      account_id: "acc-123",
      username: "testuser",
      realms: ["realm-123"],
      roles: { "realm-123": "admin" },
      is_sysadmin: false,
      realm_names: { "realm-123": "Test Realm" },
    }),
  });
}

function mock_fetch_resolves_with_204(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: true,
    status: 204,
    headers: { get: vi.fn(() => undefined) },
  });
}

function mock_fetch_resolves_session_data(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: true,
    headers: { get: vi.fn(() => "application/json") },
    json: async () => ({
      account_id: "acc-123",
      username: "testuser",
      realms: ["realm-123"],
      roles: { "realm-123": "admin" },
      current_realm: "realm-123",
      is_sysadmin: false,
      realm_names: { "realm-123": "Test Realm" },
    }),
  });
}

function mock_fetch_resolves_rune_list(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: true,
    headers: { get: vi.fn(() => "application/json") },
    json: async () => [
      {
        id: "rune-1",
        title: "First rune",
        status: "open" as const,
        priority: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ],
  });
}

function mock_fetch_resolves_rune_detail(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: true,
    headers: { get: vi.fn(() => "application/json") },
    json: async () => ({
      id: "rune-123",
      title: "Test rune",
      status: "open" as const,
      priority: 1,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      description: "Test description",
      dependencies: [],
      notes: [],
    }),
  });
}

function mock_fetch_rejects_with_404(this: Context) {
  this.mockFetch.mockResolvedValue({
    ok: false,
    status: 404,
    headers: { get: vi.fn(() => "text/plain") },
    text: async () => "Rune not found",
  });
}

function mock_fetch_rejects_with_network_error(this: Context) {
  this.mockFetch.mockRejectedValue(new Error("Network error"));
}

// ============================================
// When step functions
// ============================================

async function login_is_called(this: Context) {
  await this.client.login("test-pat-123");
}

async function logout_is_called(this: Context) {
  await this.client.logout();
}

async function session_is_fetched(this: Context) {
  const result = await this.client.getSession();
  this.sessionResult = result;
}

function realm_is_set(this: Context) {
  this.client.setRealm("my-realm-123");
}

function realm_is_cleared(this: Context) {
  this.client.setRealm(null);
}

async function runes_are_fetched(this: Context) {
  const result = await this.client.getRunes();
  this.runeListResult = result;
}

async function runes_are_fetched_with_filters(this: Context) {
  const result = await this.client.getRunes({
    status: "open",
    priority: 1,
    assignee: "user123",
  });
  this.runeListResult = result;
}

async function rune_is_fetched_by_id(this: Context) {
  const result = await this.client.getRune("rune-123");
  this.runeDetailResult = result;
}

async function rune_is_created(this: Context) {
  const result = await this.client.createRune({
    title: "Fix bug",
    description: "Critical bug",
    priority: 1,
  });
  this.runeDetailResult = result;
}

async function rune_is_updated(this: Context) {
  const result = await this.client.updateRune({
    id: "rune-123",
    title: "Updated title",
  });
  this.runeDetailResult = result;
}

async function rune_is_forged(this: Context) {
  await this.client.forgeRune("rune-123");
}

async function rune_is_claimed(this: Context) {
  await this.client.claimRune("rune-123");
}

async function rune_is_unclaimed(this: Context) {
  await this.client.unclaimRune("rune-123");
}

async function rune_is_fulfilled(this: Context) {
  await this.client.fulfillRune("rune-123");
}

async function rune_is_sealed(this: Context) {
  await this.client.sealRune("rune-123");
}

async function rune_is_shattered(this: Context) {
  await this.client.shatterRune("rune-123");
}

async function runes_are_swept(this: Context) {
  await this.client.sweepRunes();
}

async function dependency_is_added(this: Context) {
  await this.client.addDependency({
    source_id: "rune-1",
    target_id: "rune-2",
    relationship: "blocked_by",
  });
}

async function dependency_is_removed(this: Context) {
  await this.client.removeDependency({
    source_id: "rune-1",
    target_id: "rune-2",
    relationship: "blocked_by",
  });
}

async function note_is_added(this: Context) {
  await this.client.addNote({
    id: "rune-123",
    text: "This is a note",
  });
}

async function request_is_made(this: Context) {
  await this.client.getRune("rune-123");
}

// ============================================
// Then step functions
// ============================================

function fetch_was_called_with_correct_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/ui/login"),
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
      credentials: "include",
    }),
  );
}

function request_includes_pat_credentials(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  const body = JSON.parse(call[1].body);
  expect(body).toEqual({ pat: "test-pat-123" });
}

function fetch_was_called_with_logout_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/ui/logout"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_session_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/ui/session"),
    expect.any(Object),
  );
}

function session_data_is_returned(this: Context) {
  expect(this.sessionResult).toBeDefined();
  expect(this.sessionResult?.username).toBe("testuser");
  expect(this.sessionResult?.account_id).toBe("acc-123");
}

function realm_is_returned_when_retrieved(this: Context) {
  expect(this.client.getCurrentRealm()).toBe("my-realm-123");
}

function realm_is_null(this: Context) {
  expect(this.client.getCurrentRealm()).toBeNull();
}

function realm_header_was_sent(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  expect(call[1].headers).toHaveProperty("X-Bifrost-Realm", "my-realm-123");
}

function fetch_was_called_with_runes_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/runes"),
    expect.any(Object),
  );
}

function fetch_was_called_with_filtered_runes_endpoint(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  const url = call[0];
  expect(url).toContain("status=open");
  expect(url).toContain("priority=1");
  expect(url).toContain("assignee=user123");
}

function rune_list_is_returned(this: Context) {
  expect(this.runeListResult).toBeDefined();
  expect(Array.isArray(this.runeListResult)).toBe(true);
  expect(this.runeListResult?.[0].id).toBe("rune-1");
}

function fetch_was_called_with_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/rune?id=rune-123"),
    expect.any(Object),
  );
}

function rune_detail_is_returned(this: Context) {
  expect(this.runeDetailResult).toBeDefined();
  expect(this.runeDetailResult?.id).toBe("rune-123");
  expect(this.runeDetailResult?.title).toBe("Test rune");
}

function fetch_was_called_with_create_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/create-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function rune_data_is_sent_correctly(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  const body = JSON.parse(call[1].body);
  expect(body.title).toBe("Fix bug");
  expect(body.description).toBe("Critical bug");
  expect(body.priority).toBe(1);
}

function fetch_was_called_with_update_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/update-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function update_data_is_sent_correctly(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  const body = JSON.parse(call[1].body);
  expect(body.id).toBe("rune-123");
  expect(body.title).toBe("Updated title");
}

function fetch_was_called_with_forge_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/forge-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function rune_id_is_sent_correctly(this: Context) {
  const call = this.mockFetch.mock.calls[0];
  const body = JSON.parse(call[1].body);
  expect(body.id).toBe("rune-123");
}

function fetch_was_called_with_claim_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/claim-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_unclaim_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/unclaim-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_fulfill_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/fulfill-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_seal_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/seal-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_shatter_rune_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/shatter-rune"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_sweep_runes_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/sweep-runes"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_add_dependency_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/add-dependency"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_remove_dependency_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/remove-dependency"),
    expect.objectContaining({ method: "POST" }),
  );
}

function fetch_was_called_with_add_note_endpoint(this: Context) {
  expect(this.mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/add-note"),
    expect.objectContaining({ method: "POST" }),
  );
}

function api_error_is_thrown(this: Context, error: Error) {
  expect(error).toBeInstanceOf(ApiError);
}

function api_error_contains_status_and_message(this: Context, error: ApiError) {
  expect(error.status).toBe(404);
  expect(error.message).toContain("not found");
}

function api_error_has_status_zero(this: Context, error: ApiError) {
  expect(error.status).toBe(0);
  expect(error.message).toContain("Network error");
}
