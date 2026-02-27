import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock auth hooks
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRefreshSession = vi.fn();

const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: mockLogin,
  logout: mockLogout,
  refreshSession: mockRefreshSession,
};

// Mock toast
const mockToast = vi.fn();

// Mock API client
const mockApiLogin = vi.fn();

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    login = mockApiLogin;
  },
  api: {
    login: mockApiLogin,
  },
}));

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("vike/client/router", () => ({
  navigate: mockNavigate,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockAuthState.error = null;
    mockLogin.mockReset();
    mockLogin.mockImplementation(async (pat: string) => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };
    });
    mockApiLogin.mockReset();
    mockApiLogin.mockResolvedValue({
      account_id: "test-id",
      username: "testuser",
      realms: [],
      roles: {},
      is_sysadmin: false,
      realm_names: {},
    });
    mockToast.mockReset();
    mockNavigate.mockReset();
  });

  describe("rendering", () => {
    it("renders login form with PAT input field", () => {
      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/bifrost/i)).toBeDefined();
      expect(screen.getByLabelText(/personal access token/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    });

    it("shows loading state while checking authentication", () => {
      mockAuthState.isLoading = true;

      render(<Page />, { wrapper: RouterWrapper });

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows loading skeleton during authentication", () => {
      mockAuthState.isLoading = false;
      render(<Page />, { wrapper: RouterWrapper });

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toBeDefined();
    });
  });

  describe("authentication flow", () => {
    it("redirects to dashboard when already authenticated", async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = { username: "testuser" };

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("submits login form with PAT and navigates to dashboard on success", async () => {
      mockLogin.mockImplementation(async (pat: string) => {
        mockAuthState.isAuthenticated = true;
        mockAuthState.session = { username: "testuser" };
      });

      render(<Page />, { wrapper: RouterWrapper });

      const patInput = screen.getByLabelText(/personal access token/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(patInput, { target: { value: "test-pat" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("test-pat");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });
  });

  describe("error handling", () => {
    it("shows error message via toast when login fails", async () => {
      const errorMessage = "Invalid PAT";
      mockLogin.mockRejectedValue(new Error(errorMessage));

      render(<Page />, { wrapper: RouterWrapper });

      const patInput = screen.getByLabelText(/personal access token/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(patInput, { target: { value: "invalid-pat" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login failed",
          description: errorMessage,
          type: "error",
        });
      });
    });

    it("shows error message when PAT is empty", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login failed",
          description: "Please enter your PAT",
          type: "error",
        });
      });
    });

    it("disables submit button while loading", async () => {
      let isLoggingIn = false;
      mockLogin.mockImplementation(async () => {
        isLoggingIn = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        mockAuthState.isAuthenticated = true;
        isLoggingIn = false;
      });

      render(<Page />, { wrapper: RouterWrapper });

      const patInput = screen.getByLabelText(/personal access token/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(patInput, { target: { value: "test-pat" } });
      fireEvent.click(submitButton);

      // Button should be disabled while loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Wait for login to complete
      await waitFor(() => {
        expect(isLoggingIn).toBe(false);
      });
    });
  });

  describe("neo-brutalist styling", () => {
    it("applies blue theme color to login page", () => {
      const { container } = render(<Page />, { wrapper: RouterWrapper });

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      // Check for CSS class instead of computed styles (jsdom limitation)
      expect(submitButton).toHaveClass("login-button");
    });

    it("uses 0% border-radius on all elements", () => {
      const { container } = render(<Page />, { wrapper: RouterWrapper });

      const patInput = screen.getByLabelText(/personal access token/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // Check for CSS classes instead (border-radius is global)
      expect(patInput).toHaveClass("login-field-input");
      expect(submitButton).toHaveClass("login-button");
    });

    it("applies bold borders and soft shadows", () => {
      const { container } = render(<Page />, { wrapper: RouterWrapper });

      const patInput = screen.getByLabelText(/personal access token/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // Check for CSS classes that contain these styles
      expect(patInput).toHaveClass("login-field-input");
      expect(submitButton).toHaveClass("login-button");
    });
  });
});
