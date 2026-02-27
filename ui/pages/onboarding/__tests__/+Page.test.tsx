import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock auth hooks
const mockLogin = vi.fn();

const mockAuthState = {
  session: null as { username: string } | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: mockLogin,
  logout: vi.fn(),
  refreshSession: vi.fn(),
};

// Mock toast
const mockToast = vi.fn();

// Mock API client
const mockCreateAdmin = vi.fn();

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  api: {
    createAdmin: mockCreateAdmin,
  },
}));

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("vike/client/router", () => ({
  navigate: mockNavigate,
}));

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("Onboarding Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders onboarding page with wizard and header", () => {
    render(<Page />);

    // Check for main elements
    expect(screen.getByText("Welcome to Bifrost")).toBeInTheDocument();
    expect(screen.getByText(/Let's set up your first account and realm/i)).toBeInTheDocument();
  });

  it("applies neo-brutalist styling with correct classes", () => {
    const { container } = render(<Page />);

    const onboardingContainer = container.querySelector(".onboarding-container");
    expect(onboardingContainer).toBeInTheDocument();

    const card = container.querySelector(".onboarding-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("onboarding-card");
  });

  it("shows form inputs in wizard steps", () => {
    render(<Page />);

    // Check for form inputs with exact match
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter realm name (e.g., my-project)")).toBeInTheDocument();
  });

  it("calls createAdmin API and navigates to dashboard on success", async () => {
    mockCreateAdmin.mockResolvedValue({
      account_id: "acc123",
      pat: "test-pat-token",
      realm_id: "realm123",
    });

    render(<Page />);

    // Set form values using fireEvent.change
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    fireEvent.change(usernameInput, "testuser");
    
    const realmInput = screen.getByPlaceholderText("Enter realm name (e.g., my-project)");
    fireEvent.change(realmInput, "test-realm");

    // Find and click the Done button
    const buttons = screen.getAllByRole("button");
    const doneButton = buttons.find(btn => btn.textContent === "Done");
    doneButton?.click();

    // Wait for async operations
    await waitFor(() => {
      expect(mockCreateAdmin).toHaveBeenCalledWith({
        username: "testuser",
        realm_name: "test-realm",
      });
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test-pat-token");
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 10000 });
  });
});
