import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Toast } from "../Toast";

describe("Toast", () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders message", () => {
    render(<Toast id="toast-1" message="Test message" variant="info" onDismiss={mockOnDismiss} />);
    expect(screen.getByText("Test message")).toBeDefined();
  });

  it("shows success variant", () => {
    render(<Toast id="toast-1" message="Success!" variant="success" onDismiss={mockOnDismiss} />);
    const toast = screen.getByText("Success!").closest("[role='alert']");
    expect(toast?.className).toContain("bg-green-600");
  });

  it("shows error variant", () => {
    render(<Toast id="toast-1" message="Error!" variant="error" onDismiss={mockOnDismiss} />);
    const toast = screen.getByText("Error!").closest("[role='alert']");
    expect(toast?.className).toContain("bg-red-600");
  });

  it("shows warning variant", () => {
    render(<Toast id="toast-1" message="Warning!" variant="warning" onDismiss={mockOnDismiss} />);
    const toast = screen.getByText("Warning!").closest("[role='alert']");
    expect(toast?.className).toContain("bg-yellow-600");
  });

  it("shows info variant", () => {
    render(<Toast id="toast-1" message="Info!" variant="info" onDismiss={mockOnDismiss} />);
    const toast = screen.getByText("Info!").closest("[role='alert']");
    expect(toast?.className).toContain("bg-blue-600");
  });

  it("calls onDismiss when dismiss button is clicked", () => {
    render(<Toast id="toast-1" message="Test" variant="info" onDismiss={mockOnDismiss} />);
    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(mockOnDismiss).toHaveBeenCalledWith("toast-1");
  });

  it("auto-dismisses after timeout", async () => {
    render(<Toast id="toast-1" message="Test" variant="info" onDismiss={mockOnDismiss} duration={3000} />);

    vi.advanceTimersByTime(3000);

    expect(mockOnDismiss).toHaveBeenCalledWith("toast-1");
  });

  it("has proper accessibility attributes", () => {
    render(<Toast id="toast-1" message="Test" variant="info" onDismiss={mockOnDismiss} />);
    const toast = screen.getByRole("alert");
    expect(toast).toBeDefined();
  });
});
