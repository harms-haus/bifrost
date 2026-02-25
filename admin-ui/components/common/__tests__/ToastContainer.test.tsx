import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastContainer } from "../ToastContainer";

describe("ToastContainer", () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty container when no toasts", () => {
    render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders multiple toasts", () => {
    const toasts = [
      { id: "toast-1", message: "First toast", variant: "info" as const },
      { id: "toast-2", message: "Second toast", variant: "success" as const },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("First toast")).toBeDefined();
    expect(screen.getByText("Second toast")).toBeDefined();
  });

  it("positions toasts at bottom-right", () => {
    const toasts = [{ id: "toast-1", message: "Test", variant: "info" as const }];
    const { container } = render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.className).toContain("bottom-4");
    expect(containerDiv.className).toContain("right-4");
  });

  it("stacks toasts vertically", () => {
    const toasts = [
      { id: "toast-1", message: "First", variant: "info" as const },
      { id: "toast-2", message: "Second", variant: "success" as const },
    ];

    const { container } = render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.className).toContain("flex-col");
  });
});
