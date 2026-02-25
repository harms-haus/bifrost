import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("shows default (gray) variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-slate-500/20");
    expect(badge.className).toContain("text-slate-400");
  });

  it("shows success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-green-500/20");
    expect(badge.className).toContain("text-green-400");
  });

  it("shows warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-yellow-500/20");
    expect(badge.className).toContain("text-yellow-400");
  });

  it("shows error variant", () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-red-500/20");
    expect(badge.className).toContain("text-red-400");
  });

  it("shows info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-blue-500/20");
    expect(badge.className).toContain("text-blue-400");
  });

  it("shows purple variant", () => {
    render(<Badge variant="purple">Owner</Badge>);
    const badge = screen.getByText("Owner");
    expect(badge.className).toContain("bg-purple-500/20");
    expect(badge.className).toContain("text-purple-400");
  });

  it("applies custom className", () => {
    render(<Badge className="custom">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("custom");
  });
});
