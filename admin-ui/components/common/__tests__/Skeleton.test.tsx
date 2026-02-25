import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders skeleton loader", () => {
    render(<Skeleton />);
    expect(screen.getByTestId("skeleton")).toBeDefined();
  });

  it("has animation class", () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.className).toContain("animate-pulse");
  });

  it("has correct default height", () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.className).toContain("h-4");
  });
});
