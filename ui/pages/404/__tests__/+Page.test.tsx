import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("vike/client/router", () => ({
  navigate: mockNavigate,
}));

vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <nav data-testid="top-nav">TopNav</nav>,
}));
// Test route entries (defined outside describe to avoid jsx-no-new-array-as-prop)
const defaultInitialEntries = ["/404"];

// Router wrapper for testing
const RouterWrapper = ({ children, initialEntries = defaultInitialEntries }: { children: ReactNode; initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);
// eslint-disable-next-line import/no-relative-parent-imports -- Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("404 Page", () => {
  it("renders TopNav component", () => {
    render(<Page />, { wrapper: RouterWrapper });

    expect(screen.getByTestId("top-nav")).toBeDefined();
  });

  it("shows 404 error message", () => {
    render(<Page />, { wrapper: RouterWrapper });

    expect(screen.getByText(/404/i)).toBeDefined();
    expect(screen.getByText(/page not found/i)).toBeDefined();
  });

  it("shows error icon/emoji", () => {
    render(<Page />, { wrapper: RouterWrapper });

    expect(screen.getByText(/❌/i)).toBeDefined();
  });

  it("shows back to dashboard link", () => {
    render(<Page />, { wrapper: RouterWrapper });

    const dashboardLink = screen.getByText(/back to dashboard/i);
    expect(dashboardLink).toBeDefined();
  });

  it("navigates to dashboard when back link is clicked", () => {
    render(<Page />, { wrapper: RouterWrapper });

    const dashboardLink = screen.getByText(/back to dashboard/i);
    dashboardLink.click();

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
  it("has container with 404-page class", () => {
    const { container } = render(<Page />, { wrapper: RouterWrapper });

    expect(container.querySelector(".four-oh-four-page")).toBeDefined();
  });

  it("has error card with neo-brutalist styling", () => {
    const { container } = render(<Page />, { wrapper: RouterWrapper });

    const card = container.querySelector(".four-oh-four-error-card");
    expect(card).toBeDefined();
  });

  it("has neo-brutalist button styling", () => {
    const { container } = render(<Page />, { wrapper: RouterWrapper });

    const button = container.querySelector(".four-oh-four-back-button");
    expect(button).toBeDefined();
    expect(button).toHaveClass("four-oh-four-back-button");
});

});

