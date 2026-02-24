import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient, ApiError } from "./api";
import type { SessionInfo, RuneDetail, RealmDetail } from "@/types";

describe("ApiClient", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = mockFetch;
  });

  describe("constructor", () => {
    it("creates client with default options", () => {
      const client = new ApiClient();
      expect(client).toBeDefined();
    });

    it("accepts custom base URL", () => {
      const client = new ApiClient({ baseUrl: "http://localhost:3000" });
      expect(client).toBeDefined();
    });
  });

  describe("login", () => {
    it("POSTs to /ui/login with PAT", async () => {
      const client = new ApiClient();
      const mockResponse: SessionInfo = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1"],
        roles: { "realm-1": "admin" },
        is_sysadmin: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockResponse,
      });

      const result = await client.login("pat-secret");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("throws ApiError on failed login", async () => {
      const client = new ApiClient();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Invalid PAT",
      });

      await expect(client.login("bad-pat")).rejects.toThrow(ApiError);
    });
  });

  describe("getRunes", () => {
    it("GETs from /runes", async () => {
      const client = new ApiClient();
      const mockResponse = [
        {
          id: "rune-1",
          title: "Test",
          status: "open",
          priority: 2,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockResponse,
      });

      const result = await client.getRunes();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getRune", () => {
    it("GETs from /rune?id=", async () => {
      const client = new ApiClient();
      const mockResponse: RuneDetail = {
        id: "rune-1",
        title: "Test",
        status: "open",
        priority: 2,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        dependencies: [],
        notes: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockResponse,
      });

      const result = await client.getRune("rune-1");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getRealm", () => {
    it("GETs from /realm?id=", async () => {
      const client = new ApiClient();
      const mockResponse: RealmDetail = {
        realm_id: "realm-1",
        name: "Test",
        status: "active",
        created_at: "2024-01-01",
        members: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockResponse,
      });

      const result = await client.getRealm("realm-1");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("error handling", () => {
    it("throws ApiError with status code on HTTP error", async () => {
      const client = new ApiClient();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      });

      try {
        await client.getRune("nonexistent");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
      }
    });

    it("throws ApiError on network error", async () => {
      const client = new ApiClient();

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(client.getRunes()).rejects.toThrow();
    });
  });
});

describe("ApiError", () => {
  it("stores status code and message", () => {
    const error = new ApiError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("ApiError");
  });
});
