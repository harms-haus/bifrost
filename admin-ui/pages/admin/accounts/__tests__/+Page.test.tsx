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
  getAccounts: vi.fn(),
  suspendAccount: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getAccounts = mockApiState.getAccounts;
    suspendAccount = mockApiState.suspendAccount;
  },
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

// Import Page after mocks are set up
const { Page } = await import("../+Page");

// Mock data
const mockAccounts = [
  {
    account_id: "acct-1",
    username: "alice",
    status: "active" as const,
    realms: ["realm-1", "realm-2"],
    roles: { "realm-1": "owner", "realm-2": "member" },
    pat_count: 3,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    account_id: "acct-2",
    username: "bob",
    status: "suspended" as const,
    realms: ["realm-1"],
    roles: { "realm-1": "admin" },
    pat_count: 1,
    created_at: "2024-02-01T00:00:00Z",
  },
];

describe("Accounts List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockApiState.getAccounts.mockReset();
    mockApiState.suspendAccount.mockReset();
  });

  describe("when not authenticated", () => {
    it("shows login prompt", () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/log in/i)).toBeDefined();
    });
  });

  describe("when authenticated but not sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "regularuser",
        account_id: "acct-regular",
        is_sysadmin: false,
      };
    });

    it("shows access denied message", () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/access denied/i)).toBeDefined();
    });
  });

  describe("when authenticated as sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "sysadmin",
        account_id: "acct-sysadmin",
        is_sysadmin: true,
      };
      mockApiState.getAccounts.mockResolvedValue(mockAccounts);
    });

    it("fetches accounts on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getAccounts).toHaveBeenCalled();
      });
    });

    it("shows accounts list", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("alice")).toBeDefined();
        expect(screen.getByText("bob")).toBeDefined();
      });
    });

    it("shows loading state while fetching", () => {
      mockApiState.getAccounts.mockImplementation(() => new Promise(() => {}));
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
    });
  });
});
