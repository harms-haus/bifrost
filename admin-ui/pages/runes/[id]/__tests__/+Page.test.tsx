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
  getRune: vi.fn(),
  updateRune: vi.fn(),
  claimRune: vi.fn(),
  unclaimRune: vi.fn(),
  forgeRune: vi.fn(),
  fulfillRune: vi.fn(),
  sealRune: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getRune = mockApiState.getRune;
    updateRune = mockApiState.updateRune;
    claimRune = mockApiState.claimRune;
    unclaimRune = mockApiState.unclaimRune;
    forgeRune = mockApiState.forgeRune;
    fulfillRune = mockApiState.fulfillRune;
    sealRune = mockApiState.sealRune;
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
Object.defineProperty(window, "location", {
  value: {
    pathname: "/ui/runes/bf-0001",
    href: "",
    reload: vi.fn(),
  },
  writable: true,
});

// Import Page after mocks are set up
const { Page } = await import("../+Page");

// Mock data
const mockRuneDetail = {
  id: "bf-0001",
  title: "Add authentication",
  status: "open" as const,
  priority: 2,
  claimant: "alice",
  branch: "feat/auth",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  description: "Implement OAuth2 authentication",
  dependencies: [],
  notes: [],
};

describe("Rune Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockApiState.getRune.mockReset();
    mockApiState.updateRune.mockReset();
    mockApiState.claimRune.mockReset();
    mockApiState.unclaimRune.mockReset();
    mockApiState.forgeRune.mockReset();
    mockApiState.fulfillRune.mockReset();
    mockApiState.sealRune.mockReset();
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
      mockApiState.getRune.mockResolvedValue(mockRuneDetail);
    });

    it("fetches rune details on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getRune).toHaveBeenCalledWith("bf-0001");
      });
    });

    it("shows rune title", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Add authentication")).toBeDefined();
      });
    });

    it("shows rune status", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("open")).toBeDefined();
      });
    });

    it("shows rune description", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Implement OAuth2 authentication")).toBeDefined();
      });
    });

    it("shows rune metadata", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("alice")).toBeDefined();
        expect(screen.getByText("feat/auth")).toBeDefined();
      });
    });

    it("shows loading state while fetching", () => {
      mockApiState.getRune.mockImplementation(() => new Promise(() => {}));
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows error state on fetch failure", async () => {
      const { ApiError } = await import("@/lib/api");
      mockApiState.getRune.mockRejectedValue(new ApiError(500, "Failed to load"));
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeDefined();
      });
    });
  });
});
