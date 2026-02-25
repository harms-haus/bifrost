import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders when open", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText("Modal content")).toBeNull();
  });

  it("renders title", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Modal Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Modal Title")).toBeDefined();
  });

  it("calls onClose when clicking backdrop", () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    // Click the backdrop (overlay)
    const backdrop = screen.getByText("Content").parentElement?.parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders children", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button>Action</button>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeDefined();
  });

  it("has proper accessibility attributes", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Dialog">
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
