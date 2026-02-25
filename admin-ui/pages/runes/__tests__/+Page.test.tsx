import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  getRunes: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getRunes = mockApiState.getRunes;
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

// Mock window.location
let mockHref = "";
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    get href() { return mockHref; },
    set href(value: string) { mockHref = value; },
  },
  writable: true,
});

// Import Page and ApiError after mocks are set up
const { Page } = await import("../+Page");
const { ApiError } = await import("@/lib/api");

// Mock data
const mockRunes = [
  {
    id: "bf-0001",
    title: "Add authentication",
    status: "open" as const,
    priority: 2,
    claimant: "alice",
    branch: "feat/auth",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "bf-0002",
    title: "Fix login bug",
    status: "claimed" as const,
    priority: 1,
    claimant: "bob",
    branch: "fix/login",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-02T00:00:00Z",
  },
];

describe("Runes List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockApiState.getRunes.mockReset();
    mockHref = "";
  });

  describe("when not authenticated", () => {
    it("shows login prompt", () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/log in/i)).toBeDefined();
    });
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        account_id: "acct-1",
        is_sysadmin: false,
      };
      mockApiState.getRunes.mockResolvedValue(mockRunes);
    });

    it("fetches runes on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getRunes).toHaveBeenCalled();
      });
    });

    it("shows runes list", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Add authentication")).toBeDefined();
        expect(screen.getByText("Fix login bug")).toBeDefined();
      });
    });

    it("shows loading state while fetching", () => {
      mockApiState.getRunes.mockImplementation(() => new Promise(() => {}));
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows error state on fetch failure", async () => {
      mockApiState.getRunes.mockRejectedValue(new ApiError(500, "Failed to load"));
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeDefined();
      });
    });

    it("shows page header", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Runes")).toBeDefined();
      });
    });
  });
});
