import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RuneListItem } from "@/types";

// Mock data
const mockRunes: RuneListItem[] = [
  {
    id: "bf-0001",
    title: "Add authentication",
    status: "open",
    priority: 2,
    claimant: "alice",
    branch: "feat/auth",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "bf-0002",
    title: "Fix login bug",
    status: "claimed",
    priority: 1,
    claimant: "bob",
    branch: "fix/login",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-02T00:00:00Z",
  },
];

// Import after mocks are set up
const { RuneTable } = await import("../RuneTable");

describe("RuneTable", () => {
  const mockViewRune = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no runes", () => {
    render(<RuneTable runes={[]} onViewRune={mockViewRune} />);
    expect(screen.getByText(/no runes found/i)).toBeDefined();
  });

  it("renders table with runes", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByText("Add authentication")).toBeDefined();
    expect(screen.getByText("Fix login bug")).toBeDefined();
  });

  it("displays rune IDs", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByText("bf-0001")).toBeDefined();
    expect(screen.getByText("bf-0002")).toBeDefined();
  });

  it("displays status badges", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByText("open")).toBeDefined();
    expect(screen.getByText("claimed")).toBeDefined();
  });

  it("displays assignees", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByText("alice")).toBeDefined();
    expect(screen.getByText("bob")).toBeDefined();
  });

  it("displays branches", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByText("feat/auth")).toBeDefined();
    expect(screen.getByText("fix/login")).toBeDefined();
  });

  it("calls onViewRune when row is clicked", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    fireEvent.click(screen.getByText("Add authentication"));
    expect(mockViewRune).toHaveBeenCalledWith("bf-0001");
  });

  it("has proper table structure with headers", () => {
    render(<RuneTable runes={mockRunes} onViewRune={mockViewRune} />);

    expect(screen.getByRole("table")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /id/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /title/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /priority/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /assignee/i })).toBeDefined();
  });

  it("shows unassigned when no claimant", () => {
    const runesNoClaimant: RuneListItem[] = [
      {
        id: "bf-0003",
        title: "Test task",
        status: "open",
        priority: 3,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    render(<RuneTable runes={runesNoClaimant} onViewRune={mockViewRune} />);
    // Check for italic unassigned text
    const unassigned = screen.getByText((content, element) => {
      return element?.tagName === "SPAN" && element.classList.contains("italic") && content === "Unassigned";
    });
    expect(unassigned).toBeDefined();
  });

  it("shows no branch when branch is missing", () => {
    const runesNoBranch: RuneListItem[] = [
      {
        id: "bf-0004",
        title: "Test task 2",
        status: "open",
        priority: 3,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    render(<RuneTable runes={runesNoBranch} onViewRune={mockViewRune} />);
    // Check for italic no branch text
    const noBranch = screen.getByText((content, element) => {
      return element?.tagName === "SPAN" && element.classList.contains("italic") && content === "No branch";
    });
    expect(noBranch).toBeDefined();
  });
});
