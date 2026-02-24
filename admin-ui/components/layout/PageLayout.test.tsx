import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { ReactNode } from "react";

// Mock the auth hooks
vi.mock("@/lib/auth", () => ({
  AppProviders: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    session: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
  useRealm: () => ({
    selectedRealm: null,
    availableRealms: [],
    setRealm: vi.fn(),
    role: null,
  }),
}));

// Mock the Navbar component
vi.mock("./Navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("PageLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navbar and children", () => {
    render(
      <PageLayout>
        <div data-testid="child-content">Child Content</div>
      </PageLayout>,
      { wrapper: RouterWrapper }
    );

    expect(screen.getByTestId("navbar")).toBeDefined();
    expect(screen.getByTestId("child-content")).toBeDefined();
  });

  it("applies dark theme by default", () => {
    const { container } = render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>,
      { wrapper: RouterWrapper }
    );

    // The root element should have dark theme class
    expect((container.firstChild as HTMLElement)?.className).toContain("dark");
  });

  it("wraps content in main element", () => {
    render(
      <PageLayout>
        <div data-testid="main-content">Main Content</div>
      </PageLayout>,
      { wrapper: RouterWrapper }
    );

    const main = screen.getByRole("main");
    expect(main).toBeDefined();
    expect(within(main).getByTestId("main-content")).toBeDefined();
  });

  it("has proper layout structure", () => {
    const { container } = render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>,
      { wrapper: RouterWrapper }
    );

    // Should have a flex column layout
    const root = container.firstChild as HTMLElement;
    expect(root?.className).toMatch(/flex/);
    expect(root?.className).toMatch(/min-h-screen/);
  });
});
