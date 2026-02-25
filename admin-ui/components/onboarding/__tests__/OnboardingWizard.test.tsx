import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OnboardingWizard } from "../OnboardingWizard";

describe("OnboardingWizard", () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome step initially", () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    // Use more specific selector for the heading
    expect(screen.getByRole("heading", { name: /welcome to bifrost/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /get started/i })).toBeDefined();
  });

  it("shows step indicator", () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    // Use aria-label to find the step indicator nav
    expect(screen.getByLabelText(/progress/i)).toBeDefined();
  });

  it("advances to create account step when Get Started is clicked", async () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });
  });

  it("validates username is required", async () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);

    // Go to step 2
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });

    // Try to continue without username
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeDefined();
    });
  });

  it("allows going back to previous step", async () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);

    // Go to step 2
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });

    // Go back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => {
      // Use more specific selector for the heading
      expect(screen.getByRole("heading", { name: /welcome to bifrost/i })).toBeDefined();
    });
  });

  it("shows PAT display after account creation", async () => {
    // Mock successful account creation
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ account_id: "acc-123", pat: "pat_test123" }),
    });

    render(<OnboardingWizard onComplete={mockOnComplete} />);

    // Go to step 2
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });

    // Enter username
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/save your token/i)).toBeDefined();
    });
  });

  it("disables Back button on first step", () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton.hasAttribute("disabled")).toBe(true);
  });
});
