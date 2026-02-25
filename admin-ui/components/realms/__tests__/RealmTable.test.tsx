import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RealmListEntry } from "@/types";

// Mock data
const mockRealms: RealmListEntry[] = [
  {
    realm_id: "realm-1",
    name: "Production",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    realm_id: "realm-2",
    name: "Development",
    status: "suspended",
    created_at: "2024-02-01T00:00:00Z",
  },
];

// Import after mocks are set up
const { RealmTable } = await import("../RealmTable");

describe("RealmTable", () => {
  const mockViewRealm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no realms", () => {
    render(<RealmTable realms={[]} onViewRealm={mockViewRealm} />);
    expect(screen.getByText(/no realms found/i)).toBeDefined();
  });

  it("renders table with realms", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    expect(screen.getByText("Production")).toBeDefined();
    expect(screen.getByText("Development")).toBeDefined();
  });

  it("displays status badges correctly", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    // Check for status badges
    const activeBadge = screen.getByText("active");
    const suspendedBadge = screen.getByText("suspended");

    expect(activeBadge).toBeDefined();
    expect(suspendedBadge).toBeDefined();
  });

  it("displays created dates", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    // Dates should be formatted - locale may vary
    expect(screen.getByText(/2024/)).toBeDefined();
  });

  it("calls onViewRealm when row is clicked", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    fireEvent.click(screen.getByText("Production"));
    expect(mockViewRealm).toHaveBeenCalledWith("realm-1");
  });

  it("shows View button for each realm", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    expect(viewButtons.length).toBe(2);
  });

  it("calls onViewRealm when View button is clicked", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    fireEvent.click(viewButtons[0]);

    expect(mockViewRealm).toHaveBeenCalledWith("realm-1");
  });

  it("has proper table structure with headers", () => {
    render(<RealmTable realms={mockRealms} onViewRealm={mockViewRealm} />);

    expect(screen.getByRole("table")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /created/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /actions/i })).toBeDefined();
  });
});
