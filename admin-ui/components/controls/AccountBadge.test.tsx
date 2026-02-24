import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountBadge } from "./AccountBadge";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  logout: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("AccountBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.logout = vi.fn();
  });

  describe("when not authenticated", () => {
    it("renders nothing", () => {
      const { container } = render(<AccountBadge />, { wrapper: RouterWrapper });

      expect(container.firstChild).toBeNull();
    });
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };
    });

    it("shows username", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      expect(screen.getByText("testuser")).toBeDefined();
    });

    it("shows dropdown button", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      expect(button).toBeDefined();
      expect(button.textContent).toContain("testuser");
    });

    it("opens dropdown on click", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.getByRole("menuitem", { name: /my account/i })).toBeDefined();
      expect(screen.getByRole("menuitem", { name: /logout/i })).toBeDefined();
    });

    it("calls logout when clicking logout button", async () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      fireEvent.click(button);

      const logoutItem = screen.getByRole("menuitem", { name: /logout/i });
      fireEvent.click(logoutItem);

      expect(mockAuthState.logout).toHaveBeenCalled();
    });

    it("has link to account page", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      fireEvent.click(button);

      const accountLink = screen.getByRole("menuitem", { name: /my account/i });
      expect(accountLink.getAttribute("href")).toBe("/account");
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "admin" };
    });

    it("has accessible label for user menu", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      expect(button).toBeDefined();
      expect(button.getAttribute("aria-label")).toMatch(/user menu/i);
    });

    it("has aria-expanded state", () => {
      render(<AccountBadge />, { wrapper: RouterWrapper });

      const button = screen.getByRole("button", { name: /user menu/i });
      expect(button.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });
  });
});
