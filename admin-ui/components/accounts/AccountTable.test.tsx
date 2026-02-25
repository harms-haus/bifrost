import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountTable } from "./AccountTable";
import type { AccountListEntry } from "@/types";

// Mock data
const mockAccounts: AccountListEntry[] = [
  {
    account_id: "acct-1",
    username: "alice",
    status: "active",
    realms: ["realm-1", "realm-2"],
    roles: { "realm-1": "owner", "realm-2": "member" },
    pat_count: 3,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    account_id: "acct-2",
    username: "bob",
    status: "suspended",
    realms: ["realm-1"],
    roles: { "realm-1": "admin" },
    pat_count: 1,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    account_id: "acct-3",
    username: "charlie",
    status: "active",
    realms: [],
    roles: {},
    pat_count: 0,
    created_at: "2024-03-01T00:00:00Z",
  },
];

describe("AccountTable", () => {
  const mockOnViewAccount = vi.fn();
  const mockOnSuspendAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table with accounts", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    expect(screen.getByText("alice")).toBeDefined();
    expect(screen.getByText("bob")).toBeDefined();
    expect(screen.getByText("charlie")).toBeDefined();
  });

  it("displays status badges", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Status badges should be color-coded
    const activeBadges = screen.getAllByText("active");
    const suspendedBadges = screen.getAllByText("suspended");

    expect(activeBadges.length).toBe(2);
    expect(suspendedBadges.length).toBe(1);
  });

  it("shows realm count", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Check realm counts are displayed (in the Realms column)
    const rows = screen.getAllByRole("row");
    // First data row (alice) should have 2 realms
    expect(rows[1].textContent).toContain("2");
    // Second data row (bob) should have 1 realm
    expect(rows[2].textContent).toContain("1");
    // Third data row (charlie) should have 0 realms
    expect(rows[3].textContent).toContain("0");
  });

  it("shows PAT count", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // PAT counts: alice=3, bob=1, charlie=0
    expect(screen.getByText("3")).toBeDefined();
  });

  it("calls onViewAccount when row is clicked", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Click on alice's row
    fireEvent.click(screen.getByText("alice"));

    expect(mockOnViewAccount).toHaveBeenCalledWith("acct-1");
  });

  it("shows suspend button for active accounts", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Should have suspend buttons for active accounts (alice and charlie)
    // Buttons have aria-label="Suspend {username}" (not "Unsuspend")
    const suspendAlice = screen.getByRole("button", { name: /^suspend alice$/i });
    expect(suspendAlice).toBeDefined();

    const suspendCharlie = screen.getByRole("button", { name: /^suspend charlie$/i });
    expect(suspendCharlie).toBeDefined();
  });

  it("shows unsuspend button for suspended accounts", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Should have unsuspend button for bob (suspended)
    expect(screen.getByRole("button", { name: /unsuspend/i })).toBeDefined();
  });

  it("calls onSuspendAccount when suspend is clicked", () => {
    render(
      <AccountTable
        accounts={mockAccounts}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    // Click suspend for alice
    const suspendButtons = screen.getAllByRole("button", { name: /suspend/i });
    fireEvent.click(suspendButtons[0]);

    expect(mockOnSuspendAccount).toHaveBeenCalledWith("acct-1", true);
  });

  it("shows empty state when no accounts", () => {
    render(
      <AccountTable
        accounts={[]}
        onViewAccount={mockOnViewAccount}
        onSuspendAccount={mockOnSuspendAccount}
      />
    );

    expect(screen.getByText(/no accounts/i)).toBeDefined();
  });

  describe("accessibility", () => {
    it("has proper table structure", () => {
      render(
        <AccountTable
          accounts={mockAccounts}
          onViewAccount={mockOnViewAccount}
          onSuspendAccount={mockOnSuspendAccount}
        />
      );

      const table = screen.getByRole("table");
      expect(table).toBeDefined();
    });

    it("has accessible column headers", () => {
      render(
        <AccountTable
          accounts={mockAccounts}
          onViewAccount={mockOnViewAccount}
          onSuspendAccount={mockOnSuspendAccount}
        />
      );

      expect(screen.getByRole("columnheader", { name: /username/i })).toBeDefined();
      expect(screen.getByRole("columnheader", { name: /status/i })).toBeDefined();
      expect(screen.getByRole("columnheader", { name: /realms/i })).toBeDefined();
    });
  });
});
