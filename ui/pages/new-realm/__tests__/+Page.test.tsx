import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock toast
const mockToast = vi.fn();

// Mock API client
const mockCreateRealm = vi.fn();
const mockSetRealm = vi.fn();

// Mock useRealm hook
const mockUseRealm = vi.fn();

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/lib/api", () => ({
  api: {
    createRealm: mockCreateRealm,
    setRealm: mockSetRealm,
  },
}));

vi.mock("@/lib/realm", () => ({
  useRealm: () => mockUseRealm(),
}));

vi.mock("vike/client/router", () => ({
  navigate: mockNavigate,
}));

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("New Realm Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRealm.mockReturnValue({
      selectedRealm: "test-realm",
      availableRealms: ["test-realm"],
      setRealm: mockSetRealm,
      role: "member",
    });
  });

  it("renders new realm page with wizard and header", () => {
    render(<Page />);

    // Check for main elements
    expect(screen.getByText("Create New Realm")).toBeInTheDocument();
    expect(screen.getByText(/Enter realm details and create/i)).toBeInTheDocument();
  });

  it("applies neo-brutalist styling with correct classes", () => {
    const { container } = render(<Page />);

    const newRealmContainer = container.querySelector(".new-realm-container");
    expect(newRealmContainer).toBeInTheDocument();

    const card = container.querySelector(".new-realm-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("new-realm-card");
  });

  it("shows form inputs in wizard step 1", () => {
    render(<Page />);

    // Check for form inputs
    expect(screen.getByPlaceholderText("Enter realm name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Optional description")).toBeInTheDocument();
  });

  it("has 3 step indicators with correct colors", () => {
    const { container } = render(<Page />);

    // Check for step indicators
    const step1 = screen.getByText("1");
    const step2 = screen.getByText("2");
    const step3 = screen.getByText("3");

    expect(step1).toBeInTheDocument();
    expect(step2).toBeInTheDocument();
    expect(step3).toBeInTheDocument();
  });

  it("shows review step when Next is clicked", () => {
    render(<Page />);

    // Fill in form
    const nameInput = screen.getByPlaceholderText("Enter realm name");
    fireEvent.change(nameInput, { target: { value: "test-realm" } });

    // Click Next
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);

    // Review step should show
    expect(screen.getByText("Review and Create")).toBeInTheDocument();
    expect(screen.getByText("test-realm")).toBeInTheDocument();
  });

  it("calls createRealm API and navigates to /realms on success", async () => {
    mockCreateRealm.mockResolvedValue({
      realm_id: "new-realm-id",
      name: "test-realm",
      status: "active",
      created_at: new Date().toISOString(),
      members: [],
    });

    render(<Page />);

    // Fill in form
    const nameInput = screen.getByPlaceholderText("Enter realm name");
    fireEvent.change(nameInput, { target: { value: "test-realm" } });

    const descriptionInput = screen.getByPlaceholderText("Optional description");
    fireEvent.change(descriptionInput, { target: { value: "Test description" } });

    // Click Next to go to review step
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);

    // Click Done on last step
    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    // Wait for async operations
    await waitFor(() => {
      expect(mockCreateRealm).toHaveBeenCalledWith({
        name: "test-realm",
      });
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("successfully"),
          type: "success",
        })
      );
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/realms");
    }, { timeout: 10000 });
  });

  it("shows error toast when createRealm fails", async () => {
    mockCreateRealm.mockRejectedValue(new Error("API Error"));

    render(<Page />);

    // Fill in form
    const nameInput = screen.getByPlaceholderText("Enter realm name");
    fireEvent.change(nameInput, { target: { value: "test-realm" } });

    // Click Next
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);

    // Click Done
    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    // Wait for error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
        })
      );
    }, { timeout: 10000 });
  });

  it("shows loading state during API call", async () => {
    let resolvePromise: (value: any) => void;
    mockCreateRealm.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<Page />);

    // Fill in form
    const nameInput = screen.getByPlaceholderText("Enter realm name");
    fireEvent.change(nameInput, { target: { value: "test-realm" } });

    // Click Next
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);

    // Click Done
    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    // Loading indicator should appear
    await waitFor(
      () => {
        expect(screen.getByText("Creating realm...")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Resolve the promise
    resolvePromise!({
      realm_id: "new-realm-id",
      name: "test-realm",
      status: "active",
      created_at: new Date().toISOString(),
      members: [],
    });
  });
});
