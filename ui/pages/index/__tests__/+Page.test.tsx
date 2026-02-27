import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: true,
};

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("vike/client/router", () => ({
  navigate: mockNavigate,
}));

vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <nav data-testid="top-nav">TopNav</nav>,
}));

// Router wrapper for testing
const defaultInitialEntries = ["/"];
  const RouterWrapper = ({ children, initialEntries = defaultInitialEntries }: { children: ReactNode; initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);

// eslint-disable-next-line import/no-relative-parent-imports -- Import Page after mocks are set up
const { Page } = await import("../+Page");

// Test route entries (defined outside describe to avoid jsx-no-new-array-as-prop)
const testEntriesHome = ["/"];
const testEntriesDashboard = ["/dashboard"];

describe("Root Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = true;
  });

  describe("while loading", () => {
    it("shows loading state", () => {
      mockAuthState.isLoading = true;

      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/loading/i)).toBeDefined();
    });
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };
      mockAuthState.isLoading = false;
    });

    it("redirects to dashboard when not already there", async () => {
      render(<Page />, { wrapper: ({ children }) => <RouterWrapper initialEntries={testEntriesHome}>{children}</RouterWrapper> });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("does not redirect if already on dashboard (avoid infinite loop)", async () => {
      render(<Page />, { wrapper: ({ children }) => <RouterWrapper initialEntries={testEntriesDashboard}>{children}</RouterWrapper> });

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe("when not authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
      mockAuthState.isLoading = false;
    });

    it("shows TopNav", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByTestId("top-nav")).toBeDefined();
    });

    it("shows redirect message", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/redirect/i)).toBeDefined();
      expect(screen.getByText(/dashboard/i)).toBeDefined();
    });

    it("does not call navigate", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
