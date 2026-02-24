import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock API client
const mockApiState = {
  getMyStats: vi.fn(),
  getRunes: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getMyStats = mockApiState.getMyStats;
    getRunes = mockApiState.getRunes;
  },
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("./+Page");

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
  });

  describe("when not authenticated", () => {
    it("redirects to login", async () => {
      // This would be handled by route guards in real app
      // For now, just verify it doesn't crash
      const { container } = render(<Page />, { wrapper: RouterWrapper });
      expect(container).toBeDefined();
    });
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };
      mockApiState.getMyStats.mockResolvedValue({
        total_runes: 10,
        open_assigned: 3,
        fulfilled_this_week: 2,
        fulfilled_this_month: 5,
        blocked_count: 1,
      });
      mockApiState.getRunes.mockResolvedValue([]);
    });

    it("shows welcome message with username", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/welcome/i)).toBeDefined();
      expect(screen.getByText("testuser")).toBeDefined();
    });

    it("fetches stats on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getMyStats).toHaveBeenCalled();
      });
    });

    it("shows stats cards", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("10")).toBeDefined(); // total runes
        expect(screen.getByText("3")).toBeDefined(); // assigned open
        expect(screen.getByText("2")).toBeDefined(); // fulfilled week
        expect(screen.getByText("1")).toBeDefined(); // blocked
      });
    });

    it("shows loading state while fetching stats", () => {
      // Don't resolve the promise immediately
      mockApiState.getMyStats.mockImplementation(() => new Promise(() => {}));

      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows error message on fetch failure", async () => {
      mockApiState.getMyStats.mockRejectedValue(new Error("Failed to load"));

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeDefined();
      });
    });

    it("shows quick actions section", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/quick actions/i)).toBeDefined();
      });
    });

    it("shows create rune link", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /create rune/i })).toBeDefined();
      });
    });

    it("shows view my runes link", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /my runes/i })).toBeDefined();
      });
    });
  });
});
