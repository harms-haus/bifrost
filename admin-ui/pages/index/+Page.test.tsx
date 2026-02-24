import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: true,
};

const mockOnboardingState = {
  needsOnboarding: false,
};

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    checkOnboarding = vi.fn().mockImplementation(() =>
      Promise.resolve({ needs_onboarding: mockOnboardingState.needsOnboarding })
    );
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("./+Page");

describe("Root Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = true;
    mockOnboardingState.needsOnboarding = false;
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

    it("redirects to dashboard", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });
  });

  describe("when not authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
      mockAuthState.isLoading = false;
    });

    it("redirects to login when onboarding not needed", async () => {
      mockOnboardingState.needsOnboarding = false;

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
      });
    });

    it("redirects to onboarding when onboarding needed", async () => {
      mockOnboardingState.needsOnboarding = true;

      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/onboarding", { replace: true });
      });
    });
  });
});
