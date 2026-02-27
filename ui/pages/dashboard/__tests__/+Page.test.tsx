import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock auth hooks
const mockAuthState = {
  session: { username: "testuser", realms: ["realm1", "realm2"], roles: {} } as { username: string; realms: string[]; roles: Record<string, string> } | null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock realm hooks
const mockRealmState = {
  selectedRealm: null as string | null,
  availableRealms: ["realm1", "realm2"],
  setRealm: vi.fn(),
  role: null as string | null,
};

// Mock API client
const mockApiState = {
  getRunes: vi.fn(),
  getRealms: vi.fn(),
  getAccounts: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/realm", () => ({
  useRealm: () => mockRealmState,
  RealmProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  AuthContext: { Provider: ({ children }: { children: ReactNode }) => <>{children}</> },
}));

vi.mock("@/lib/api", () => ({
  api: {
    getRunes: mockApiState.getRunes,
    getRealms: mockApiState.getRealms,
    getAccounts: mockApiState.getAccounts,
  },
}));

vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <nav data-testid="top-nav">TopNav</nav>,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("Dashboard Page (RED Theme)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.session = null;
    mockRealmState.selectedRealm = "realm1";
    mockRealmState.availableRealms = ["realm1", "realm2"];
    mockRealmState.role = "member";

    // Reset API mocks
    mockApiState.getRunes.mockResolvedValue([
      { id: "1", title: "Rune 1", status: "open", priority: 1, created_at: "", updated_at: "" },
      { id: "2", title: "Rune 2", status: "open", priority: 2, created_at: "", updated_at: "" },
    ]);
    mockApiState.getRealms.mockResolvedValue([
      { realm_id: "realm1", name: "Realm 1", status: "active", created_at: "" },
      { realm_id: "realm2", name: "Realm 2", status: "active", created_at: "" },
    ]);
    mockApiState.getAccounts.mockResolvedValue([
      { account_id: "acc1", username: "user1", status: "active", realms: [], roles: {}, pat_count: 0, created_at: "" },
      { account_id: "acc2", username: "user2", status: "active", realms: [], roles: {}, pat_count: 0, created_at: "" },
    ]);
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        realms: ["realm1", "realm2"],
        roles: { realm1: "member" },
      };
    });

    it("renders TopNav component", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByTestId("top-nav")).toBeDefined();
    });

    it("shows welcome message with username", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeDefined();
        expect(screen.getByText("testuser")).toBeDefined();
      });
    });

    it("fetches runes, realms, and accounts on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getRunes).toHaveBeenCalled();
        expect(mockApiState.getRealms).toHaveBeenCalled();
        expect(mockApiState.getAccounts).toHaveBeenCalled();
      });
    });

    it("shows statistics cards with correct counts", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Total Runes")).toBeDefined();
        expect(screen.getByText("Total Realms")).toBeDefined();
        expect(screen.getByText("Total Accounts")).toBeDefined();
        expect(screen.getByText("Open Runes")).toBeDefined();
        // Check that there are 4 stats cards with values
        const statsValues = document.querySelectorAll(".dashboard-stats-value");
        expect(statsValues.length).toBe(4);
        // All values should be "2" based on mock data
        statsValues.forEach(value => {
          expect(value.textContent).toBe("2");
        });
      });
    });

    it("shows loading state while fetching statistics", () => {
      // Don't resolve the promise immediately
      mockApiState.getRunes.mockImplementation(() => new Promise(() => {}));

      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows skeleton loading states for cards", () => {
      // Don't resolve the promise immediately
      mockApiState.getRunes.mockImplementation(() => new Promise(() => {}));

      render(<Page />, { wrapper: RouterWrapper });

      // Look for skeleton elements
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("uses current realm from useRealm hook", async () => {
      mockRealmState.selectedRealm = "realm2";
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Realm 2")).toBeDefined();
      });
    });

    it("applies RED theme color (--color-red) to primary elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        // Check for elements with red color styling
        const redElements = document.querySelectorAll('[style*="var(--color-red)"]');
        expect(redElements.length).toBeGreaterThan(0);
      });
    });

    it("handles API errors gracefully", async () => {
      mockApiState.getRunes.mockRejectedValue(new Error("Failed to load"));

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).toBeNull();
        // Should still show welcome message even on error
        expect(screen.getByText(/welcome/i)).toBeDefined();
      });
    });
  });

  describe("when not authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
    });

    it("shows login prompt", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/log in/i)).toBeDefined();
    });

    it("does not fetch statistics when not authenticated", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      // Wait a bit to ensure no calls were made
      await waitFor(() => {
        expect(mockApiState.getRunes).not.toHaveBeenCalled();
        expect(mockApiState.getRealms).not.toHaveBeenCalled();
        expect(mockApiState.getAccounts).not.toHaveBeenCalled();
      });
    });
  });
});
