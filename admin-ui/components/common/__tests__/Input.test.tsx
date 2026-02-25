import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renders text input", () => {
    render(<Input type="text" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("renders password input", () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveProperty("type", "password");
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input type="text" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Input type="text" disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveProperty("disabled", true);
  });

  it("shows error state", () => {
    render(<Input type="text" error />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });

  it("shows error message", () => {
    render(<Input type="text" error errorMessage="Invalid input" />);
    expect(screen.getByText("Invalid input")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<Input type="text" className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-class");
  });

  it("supports label", () => {
    render(<Input type="text" label="Username" id="username" />);
    expect(screen.getByLabelText("Username")).toBeDefined();
  });
});
