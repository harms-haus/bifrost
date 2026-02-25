import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as {
    username: string;
    account_id: string;
    is_sysadmin: boolean;
  } | null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock API client
const mockApiState = {
  getAccount: vi.fn(),
  suspendAccount: vi.fn(),
  grantRealm: vi.fn(),
  revokeRealm: vi.fn(),
  createPat: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getAccount = mockApiState.getAccount;
    suspendAccount = mockApiState.suspendAccount;
    grantRealm = mockApiState.grantRealm;
    revokeRealm = mockApiState.revokeRealm;
    createPat = mockApiState.createPat;
  },
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

// Import Page after mocks are set up
const { Page } = await import("./+Page");

// Mock data
const mockAccountDetail = {
  account_id: "acct-1",
  username: "testuser",
  status: "active" as const,
  realms: ["realm-1", "realm-2"],
  roles: { "realm-1": "owner", "realm-2": "member" },
  pat_count: 2,
  created_at: "2024-01-01T00:00:00Z",
};

