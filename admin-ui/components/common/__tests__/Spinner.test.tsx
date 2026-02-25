import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner", () => {
  it("renders spinner", () => {
    render(<Spinner />);
    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  it("has animation class", () => {
    render(<Spinner />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner.getAttribute("class")).toContain("animate-spin");
  });

  it("renders small size", () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByTestId("spinner");
    const classNames = spinner.getAttribute("class") || "";
    expect(classNames).toContain("w-4");
    expect(classNames).toContain("h-4");
  });

  it("renders medium size by default", () => {
    render(<Spinner />);
    const spinner = screen.getByTestId("spinner");
    const classNames = spinner.getAttribute("class") || "";
    expect(classNames).toContain("w-6");
    expect(classNames).toContain("h-6");
  });

  it("renders large size", () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByTestId("spinner");
    const classNames = spinner.getAttribute("class") || "";
    expect(classNames).toContain("w-8");
    expect(classNames).toContain("h-8");
  });
});
