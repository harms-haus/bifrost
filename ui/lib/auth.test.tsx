import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { type ReactNode } from "react";
import type { SessionInfo, LoginResponse } from "@/types";

const mockFns = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn(),
  setRealm: vi.fn(),
  ApiError: class TestApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

vi.mock("./api", () => {
  return {
    api: {
      login: mockFns.login,
      logout: mockFns.logout,
      getSession: mockFns.getSession,
      setRealm: mockFns.setRealm,
    },
    ApiError: mockFns.ApiError,
  };
});

import { AuthProvider, useAuth } from "./auth";

const mockSession: SessionInfo = {
  account_id: "acc_123",
  username: "testuser",
  realms: ["realm_1", "realm_2"],
  roles: { realm_1: "admin", realm_2: "member" },
  is_sysadmin: false,
  realm_names: { realm_1: "Realm 1", realm_2: "Realm 2" },
};

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw error when useAuth is used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );
  });

  it("should initialize with loading state and load session on mount", async () => {
    mockFns.getSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFns.getSession).toHaveBeenCalledOnce();
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle unauthenticated session (401)", async () => {
    mockFns.getSession.mockRejectedValue(new mockFns.ApiError(401, "Unauthorized"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle session load error", async () => {
    mockFns.getSession.mockRejectedValue(new mockFns.ApiError(500, "Internal Server Error"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Internal Server Error");
  });

  it("should login successfully with PAT", async () => {
    mockFns.getSession.mockResolvedValue(null);
    mockFns.login.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test_pat_123");
    });

    expect(mockFns.login).toHaveBeenCalledWith("test_pat_123");
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle login failure", async () => {
    mockFns.getSession.mockResolvedValue(null);
    mockFns.login.mockRejectedValue(new mockFns.ApiError(403, "Invalid PAT"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.login("invalid_pat");
      });
    }).rejects.toThrow("Invalid PAT");
  });

  it("should logout successfully", async () => {
    mockFns.getSession.mockResolvedValue(mockSession);
    mockFns.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockFns.logout).toHaveBeenCalledOnce();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should clear session even if logout fails", async () => {
    mockFns.getSession.mockResolvedValue(mockSession);
    mockFns.logout.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should refresh session on demand", async () => {
    mockFns.getSession
      .mockResolvedValueOnce(mockSession)
      .mockResolvedValueOnce({
        ...mockSession,
        username: "updated_user",
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session?.username).toBe("testuser");

    await act(async () => {
      await result.current.refreshSession();
    });

    expect(mockFns.getSession).toHaveBeenCalledTimes(2);
    expect(result.current.session?.username).toBe("updated_user");
  });
});
