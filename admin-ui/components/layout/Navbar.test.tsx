import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "./Navbar";
import type { SessionInfo } from "@/types";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as SessionInfo | null,
  isAuthenticated: false,
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
  useRealm: () => ({
    selectedRealm: "realm-1",
    availableRealms: ["realm-1"],
    setRealm: vi.fn(),
    role: "admin",
  }),
}));

// Wrapper with Router for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
  });

  describe("unauthenticated user", () => {
    it("shows only Dashboard link", () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;

      render(<Navbar />, { wrapper: RouterWrapper });

      const nav = screen.getByRole("navigation");
      expect(within(nav).getByRole("link", { name: /dashboard/i })).toBeDefined();

      // Should not show restricted nav items
      expect(within(nav).queryByRole("link", { name: /runes/i })).toBeNull();
      expect(within(nav).queryByRole("link", { name: /accounts/i })).toBeNull();
      expect(within(nav).queryByRole("link", { name: /realms/i })).toBeNull();
    });

    it("shows Login button", () => {
      mockAuthState.isAuthenticated = false;

      render(<Navbar />, { wrapper: RouterWrapper });

      expect(screen.getByRole("link", { name: /login/i })).toBeDefined();
    });
  });

  describe("authenticated regular user", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        account_id: "acct-123",
        username: "testuser",
        realms: ["realm-1"],
        roles: { "realm-1": "member" },
        is_sysadmin: false,
      };
    });

    it("shows Dashboard and Runes links", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      const nav = screen.getByRole("navigation");
      expect(within(nav).getByRole("link", { name: /dashboard/i })).toBeDefined();
      expect(within(nav).getByRole("link", { name: /runes/i })).toBeDefined();
    });

    it("does not show admin-only links", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      const nav = screen.getByRole("navigation");
      expect(within(nav).queryByRole("link", { name: /accounts/i })).toBeNull();
      expect(within(nav).queryByRole("link", { name: /realms/i })).toBeNull();
    });

    it("shows user menu with username", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      expect(screen.getByText("testuser")).toBeDefined();
    });

    it("shows Logout button", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
    });
  });

  describe("authenticated realm admin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        account_id: "acct-123",
        username: "realmadmin",
        realms: ["realm-1"],
        roles: { "realm-1": "admin" },
        is_sysadmin: false,
      };
    });

    it("shows Realm link for realm admin", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      const nav = screen.getByRole("navigation");
      expect(within(nav).getByRole("link", { name: /realm/i })).toBeDefined();
    });
  });

  describe("authenticated sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        account_id: "acct-123",
        username: "sysadmin",
        realms: ["realm-1", "realm-2"],
        roles: { "realm-1": "admin", _admin: "admin" },
        is_sysadmin: true,
      };
    });

    it("shows all navigation links", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      const nav = screen.getByRole("navigation");
      expect(within(nav).getByRole("link", { name: /dashboard/i })).toBeDefined();
      expect(within(nav).getByRole("link", { name: /runes/i })).toBeDefined();
      // Realm (singular) for the current realm
      expect(within(nav).getAllByRole("link", { name: /^Realm$/i }).length).toBeGreaterThan(0);
      expect(within(nav).getByRole("link", { name: /accounts/i })).toBeDefined();
      expect(within(nav).getByRole("link", { name: /^Realms$/i })).toBeDefined();
    });
  });

  describe("mobile responsiveness", () => {
    it("has hamburger menu button on mobile", () => {
      render(<Navbar />, { wrapper: RouterWrapper });

      // The hamburger button should have an accessible label
      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeDefined();
    });
  });
});
