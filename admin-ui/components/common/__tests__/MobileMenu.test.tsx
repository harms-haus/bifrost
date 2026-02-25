import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileMenu } from "../MobileMenu";

describe("MobileMenu", () => {
  const mockOnClose = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <MobileMenu open={true} onClose={mockOnClose}>
        <button>Menu Item</button>
      </MobileMenu>
    );
    expect(screen.getByText("Menu Item")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(
      <MobileMenu open={false} onClose={mockOnClose}>
        <button>Menu Item</button>
      </MobileMenu>
    );
    expect(screen.queryByText("Menu Item")).toBeNull();
  });

  it("calls onClose when backdrop is clicked", () => {
    const { container } = render(
      <MobileMenu open={true} onClose={mockOnClose}>
        <button>Menu Item</button>
      </MobileMenu>
    );

    // Click the backdrop (the outer div with bg-black/50)
    const backdrop = container.querySelector(".bg-black\\/50");
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when escape key is pressed", () => {
    render(
      <MobileMenu open={true} onClose={mockOnClose}>
        <button>Menu Item</button>
      </MobileMenu>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("has proper accessibility attributes", () => {
    render(
      <MobileMenu open={true} onClose={mockOnClose}>
        <button>Menu Item</button>
      </MobileMenu>
    );
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
