import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomSheet } from "../BottomSheet";

describe("BottomSheet", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <BottomSheet open={true} onClose={mockOnClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet content")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(
      <BottomSheet open={false} onClose={mockOnClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet content")).toBeNull();
  });

  it("calls onClose when backdrop is clicked", () => {
    const { container } = render(
      <BottomSheet open={true} onClose={mockOnClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );

    // Click the backdrop
    const backdrop = container.querySelector(".bg-black\\/50");
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when escape key is pressed", () => {
    render(
      <BottomSheet open={true} onClose={mockOnClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("has proper accessibility attributes", () => {
    render(
      <BottomSheet open={true} onClose={mockOnClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("renders title when provided", () => {
    render(
      <BottomSheet open={true} onClose={mockOnClose} title="Filter Options">
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Filter Options")).toBeDefined();
  });
});
