import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock the auth hook
const mockAuthState = {
  session: null as { username: string; realms: string[]; roles: Record<string, string>; is_sysadmin: boolean; realm_names: Record<string, string> } | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
};

const mockThemeState = {
  isDark: true,
  toggleTheme: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/theme", () => ({
  useTheme: () => mockThemeState,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
<MemoryRouter>{children}</MemoryRouter>
);

// Import TopNav component
import { TopNav } from "./TopNav";

describe("TopNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockThemeState.isDark = true;
  });

  describe("component structure", () => {
    it("renders Bifrost logo that links to dashboard", () => {
      render(<TopNav />, { wrapper: RouterWrapper });

      const logo = screen.getByRole("link", { name: /bifrost/i });
      expect(logo).toBeDefined();
      expect(logo).toHaveAttribute("href", "/dashboard");
    });

    it("renders navigation links for Dashboard, Runes, Realms, Accounts", () => {
      render(<TopNav />, { wrapper: RouterWrapper });

      expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /runes/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /realms/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /accounts/i })).toBeDefined();
    });

    it("renders theme toggle button", () => {
      render(<TopNav />, { wrapper: RouterWrapper });

      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      expect(themeToggle).toBeDefined();
    });

    it("renders account badge when authenticated", () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
        is_sysadmin: false,
        realm_names: { realm1: "Test Realm" },
      };

      render(<TopNav />, { wrapper: RouterWrapper });

      expect(screen.getByText(/testuser/i)).toBeDefined();
    });

    it("does not render account badge when not authenticated", () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;

      render(<TopNav />, { wrapper: RouterWrapper });

      expect(screen.queryByRole("button", { name: /account/i })).toBeNull();
    });
  });

  describe("rainbow indicator", () => {
    it("renders sliding indicator element", () => {
      render(<TopNav />, { wrapper: RouterWrapper });

      const indicator = screen.getByTestId("rainbow-indicator");
      expect(indicator).toBeDefined();
    });
  });

  describe("theme toggle", () => {
    it("calls toggleTheme when theme button is clicked", () => {
      render(<TopNav />, { wrapper: RouterWrapper });

      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      themeToggle.click();

      expect(mockThemeState.toggleTheme).toHaveBeenCalled();
    });
  });

  describe("account menu", () => {
    it("renders account badge as button when authenticated", () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
        is_sysadmin: false,
        realm_names: { realm1: "Test Realm" },
      };

      render(<TopNav />, { wrapper: RouterWrapper });

      const accountBadge = screen.getByRole("button", { name: /testuser/i });
      expect(accountBadge).toBeDefined();
    });

    it("account badge is clickable", () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
        is_sysadmin: false,
        realm_names: { realm1: "Test Realm" },
      };

      render(<TopNav />, { wrapper: RouterWrapper });

      const accountBadge = screen.getByRole("button", { name: /testuser/i });
      expect(() => accountBadge.click()).not.toThrow();
    });
  });
});
