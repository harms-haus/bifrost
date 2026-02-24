import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  error: null as string | null,
};

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("./+Page");

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockAuthState.login = vi.fn();
    mockAuthState.error = null;
  });

  describe("when already authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };
    });

    it("redirects to dashboard", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });
  });

  describe("login form", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
    });

    it("shows PAT input field", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByLabelText(/personal access token/i)).toBeDefined();
    });

    it("shows submit button", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    });

    it("shows link to onboarding", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByRole("link", { name: /first time/i })).toBeDefined();
    });

    it("submits form with PAT value", async () => {
      mockAuthState.login.mockResolvedValueOnce(undefined);

      render(<Page />, { wrapper: RouterWrapper });

      const input = screen.getByLabelText(/personal access token/i);
      const button = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(input, { target: { value: "test-pat-123" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAuthState.login).toHaveBeenCalledWith("test-pat-123");
      });
    });

    it("shows loading state during login", async () => {
      let resolveLogin: () => void;
      mockAuthState.login.mockImplementation(
        () => new Promise<void>((resolve) => {
          resolveLogin = resolve;
        })
      );

      render(<Page />, { wrapper: RouterWrapper });

      const input = screen.getByLabelText(/personal access token/i);
      const button = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(input, { target: { value: "test-pat" } });
      fireEvent.click(button);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /signing in/i })).toBeDefined();
      });

      // Resolve the promise
      resolveLogin!();
    });

    it("shows error message on login failure", async () => {
      mockAuthState.login.mockRejectedValueOnce(new Error("Invalid PAT"));

      render(<Page />, { wrapper: RouterWrapper });

      const input = screen.getByLabelText(/personal access token/i);
      const button = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(input, { target: { value: "invalid-pat" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/invalid pat/i)).toBeDefined();
      });
    });

    it("disables submit button while loading", async () => {
      let resolveLogin: () => void;
      mockAuthState.login.mockImplementation(
        () => new Promise<void>((resolve) => {
          resolveLogin = resolve;
        })
      );

      render(<Page />, { wrapper: RouterWrapper });

      const input = screen.getByLabelText(/personal access token/i);
      const button = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;

      fireEvent.change(input, { target: { value: "test-pat" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button.disabled).toBe(true);
      });

      resolveLogin!();
    });

    it("requires PAT input before submission", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      const input = screen.getByLabelText(/personal access token/i);
      expect(input.hasAttribute("required")).toBe(true);
    });
  });
});
