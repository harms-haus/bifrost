import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock auth hooks
const mockAuthState = {
  session: {
    account_id: "acc1",
    username: "testuser",
    realms: ["realm1", "realm2"],
    roles: { realm1: "member", realm2: "admin" },
    current_realm: "realm1",
    is_sysadmin: false,
    realm_names: { realm1: "Realm 1", realm2: "Realm 2" },
  },
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
};

// Mock toast hook
const mockToastState = vi.fn();

// Mock API client
const mockApiState = {
  getPats: vi.fn(),
  createPat: vi.fn(),
  revokePat: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToastState,
}));

vi.mock("@/lib/api", () => ({
  api: {
    getPats: mockApiState.getPats,
    createPat: mockApiState.createPat,
    revokePat: mockApiState.revokePat,
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

describe("User Account Page (PURPLE Theme)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.session = null;

    // Reset API mocks
    mockApiState.getPats.mockResolvedValue([
      {
        id: "pat1",
        name: "Development",
        prefix: "bifrost_pat_xxxx",
        created_at: "2024-01-01T00:00:00Z",
      },
    ]);
    mockApiState.createPat.mockResolvedValue({ pat: "bifrost_pat_newtoken123456789" });
    mockApiState.revokePat.mockResolvedValue(undefined);
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        account_id: "acc1",
        username: "testuser",
        realms: ["realm1", "realm2"],
        roles: { realm1: "member", realm2: "admin" },
        current_realm: "realm1",
        is_sysadmin: false,
        realm_names: { realm1: "Realm 1", realm2: "Realm 2" },
      };
    });

    it("renders TopNav component", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByTestId("top-nav")).toBeDefined();
    });

    it("shows user account page with username", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("My Account")).toBeDefined();
        expect(screen.getByText("testuser")).toBeDefined();
      });
    });

    it("displays user's realms and roles", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Realm 1")).toBeDefined();
        expect(screen.getByText("member")).toBeDefined();
        expect(screen.getByText("Realm 2")).toBeDefined();
        expect(screen.getByText("admin")).toBeDefined();
      });
    });

    it("fetches and displays PAT entries", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getPats).toHaveBeenCalled();
      });

      expect(screen.getByText("Development")).toBeDefined();
    });

    it("shows logout button", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const logoutBtn = screen.getByText(/logout/i);
        expect(logoutBtn).toBeDefined();
      });
    });

    it("shows edit profile link", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const editLink = screen.getByText(/edit profile/i);
        expect(editLink).toBeDefined();
      });
    });

    it("applies PURPLE theme color (--color-purple) to primary elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const purpleElements = document.querySelectorAll('.user-account-edit-link');
        expect(purpleElements.length).toBeGreaterThan(0);
      });
    });

    it("shows loading state while fetching PATs", () => {
      mockApiState.getPats.mockImplementation(() => new Promise(() => {}));

      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("handles PAT rotation", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const rotateBtn = screen.getByText(/rotate/i);
        expect(rotateBtn).toBeDefined();
      });

      // Click rotate button
      const rotateBtn = screen.getByText(/rotate/i);
      rotateBtn.click();

      await waitFor(() => {
        expect(mockApiState.createPat).toHaveBeenCalledWith({
          account_id: "acc1",
          name: "Default",
        });
        expect(mockToastState).toHaveBeenCalled();
      });
    });

    it("handles logout click", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const logoutBtn = screen.getByText(/logout/i);
        logoutBtn.click();

        expect(mockAuthState.logout).toHaveBeenCalled();
      });
    });

    it("shows empty state when no PATs exist", async () => {
      mockApiState.getPats.mockResolvedValue([]);

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/No personal access tokens/i)).toBeDefined();
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

      expect(screen.getByText("Log in")).toBeDefined();
    });

    it("does not fetch PATs when not authenticated", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getPats).not.toHaveBeenCalled();
      });
    });
  });
});
