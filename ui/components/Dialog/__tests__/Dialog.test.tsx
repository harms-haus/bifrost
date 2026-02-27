import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "../Dialog";

describe("Dialog Component", () => {
  describe("GIVEN a Dialog with title, description and callbacks", () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    it("THEN it should render title and description when open", () => {
      render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("Delete Item")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Are you sure you want to delete this item? This action cannot be undone.",
        ),
      ).toBeInTheDocument();
    });

    it("THEN it should not render when closed", () => {
      const { container } = render(
        <Dialog
          open={false}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const dialogElement = container.querySelector('[role="dialog"]');
      expect(dialogElement).not.toBeInTheDocument();
    });

    it("THEN it should render Confirm and Cancel buttons", () => {
      render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("THEN it should call onConfirm when Confirm button is clicked", () => {
      render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("THEN it should call onCancel when Cancel button is clicked", () => {
      render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("THEN it should theme dialog with themeColor prop", () => {
      const { container } = render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          themeColor="#d95b43"
        />,
      );

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      expect(confirmButton).toHaveStyle({ borderColor: "#d95b43" });
    });
  });

  describe("GIVEN a Dialog with default theme color", () => {
    it("THEN it should use default blue color when themeColor is not provided", () => {
      const mockOnConfirm = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = render(
        <Dialog
          open={true}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      expect(confirmButton).toHaveStyle({ borderColor: "#7fc3ec" });
    });
  });
});
