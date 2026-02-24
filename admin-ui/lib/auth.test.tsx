import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { ReactNode } from "react";
import type { SessionInfo, LoginResponse } from "@/types";

// Use vi.hoisted to define mock functions before vi.mock is hoisted
const mockFns = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn(),
  setRealm: vi.fn(),
  getRealm: vi.fn(),
}));

// Mock the API client module
vi.mock("./api", () => {
  return {
    ApiClient: class MockApiClient {
      login = mockFns.login;
      logout = mockFns.logout;
      getSession = mockFns.getSession;
      setRealm = mockFns.setRealm;
      getRealm = mockFns.getRealm;
    },
    ApiError: class ApiError extends Error {
      status: number;
      constructor(status: number, message: string) {
        super(message);
        this.status = status;
      }
    },
  };
});

// Import after mocking
import {
  AuthProvider,
  useAuth,
  useSession,
  useRealm,
  AppProviders,
} from "./auth";

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("useAuth hook", () => {
    it("provides initial unauthenticated state", () => {
      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("login authenticates user and updates session", async () => {
      const mockResponse: LoginResponse = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1"],
        roles: { "realm-1": "admin" },
        is_sysadmin: true,
      };

      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));
      mockFns.login.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      await act(async () => {
        await result.current.login("test-pat");
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.session?.username).toBe("testuser");
      });
    });

    it("login failure does not authenticate user", async () => {
      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));
      mockFns.login.mockRejectedValueOnce(new Error("Invalid PAT"));

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      await expect(
        act(async () => {
          await result.current.login("bad-pat");
        })
      ).rejects.toThrow();

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("logout clears session", async () => {
      const mockResponse: LoginResponse = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1"],
        roles: { "realm-1": "admin" },
        is_sysadmin: true,
      };

      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));
      mockFns.login.mockResolvedValueOnce(mockResponse);
      mockFns.logout.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      // Login first
      await act(async () => {
        await result.current.login("test-pat");
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.session).toBeNull();
      });
    });
  });

  describe("useSession hook", () => {
    it("returns current session info", async () => {
      const mockResponse: SessionInfo = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1"],
        roles: { "realm-1": "admin" },
        is_sysadmin: true,
      };

      mockFns.getSession.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSession(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockResponse);
      });
    });
  });

  describe("useRealm hook", () => {
    it("returns selected realm and available realms after login", async () => {
      const mockResponse: LoginResponse = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1", "realm-2"],
        roles: { "realm-1": "admin", "realm-2": "member" },
        is_sysadmin: false,
      };

      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));
      mockFns.login.mockResolvedValueOnce(mockResponse);

      // Use a single renderHook that accesses both hooks
      const { result } = renderHook(
        () => ({
          auth: useAuth(),
          realm: useRealm(),
        }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <AppProviders>{children}</AppProviders>
          ),
        }
      );

      // Login first
      await act(async () => {
        await result.current.auth.login("test-pat");
      });

      await waitFor(() => {
        expect(result.current.realm.selectedRealm).toBeDefined();
        expect(result.current.realm.availableRealms).toContain("realm-1");
        expect(result.current.realm.availableRealms).toContain("realm-2");
      });
    });

    it("setRealm updates selected realm after login", async () => {
      const mockResponse: LoginResponse = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1", "realm-2"],
        roles: { "realm-1": "admin", "realm-2": "member" },
        is_sysadmin: false,
      };

      mockFns.getSession.mockRejectedValueOnce(new Error("Not authenticated"));
      mockFns.login.mockResolvedValueOnce(mockResponse);

      // Use a single renderHook that accesses both hooks
      const { result } = renderHook(
        () => ({
          auth: useAuth(),
          realm: useRealm(),
        }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <AppProviders>{children}</AppProviders>
          ),
        }
      );

      // Login first
      await act(async () => {
        await result.current.auth.login("test-pat");
      });

      // Wait for initial state
      await waitFor(() => {
        expect(result.current.realm.availableRealms.length).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.realm.setRealm("realm-2");
      });

      await waitFor(() => {
        expect(result.current.realm.selectedRealm).toBe("realm-2");
      });
    });
  });
});
