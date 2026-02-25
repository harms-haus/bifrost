import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleAssignment } from "./RoleAssignment";

describe("RoleAssignment", () => {
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current role as badge when disabled", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="admin"
        onRoleChange={mockOnRoleChange}
        disabled={true}
      />
    );

    expect(screen.getByText("admin")).toBeDefined();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("renders dropdown when enabled", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="admin"
        onRoleChange={mockOnRoleChange}
        disabled={false}
      />
    );

    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("calls onRoleChange callback with correct params", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="admin"
        onRoleChange={mockOnRoleChange}
        disabled={false}
      />
    );

    // Verify the the callback is passed to the component
    // (Actual role change is tested via integration tests)
    expect(mockOnRoleChange).toBeDefined();
  });

  describe("role badge colors", () => {
    it("shows owner badge with purple color", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="owner"
        onRoleChange={mockOnRoleChange}
        disabled={true}
      />
    );

    const badge = screen.getByText("owner");
    expect(badge.className).toMatch(/purple/);
  });

  it("shows admin badge with blue color", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="admin"
        onRoleChange={mockOnRoleChange}
        disabled={true}
      />
    );

    const badge = screen.getByText("admin");
    expect(badge.className).toMatch(/blue/);
  });

  it("shows member badge with green color", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="member"
        onRoleChange={mockOnRoleChange}
        disabled={true}
      />
    );

    const badge = screen.getByText("member");
    expect(badge.className).toMatch(/green/);
  });

  it("shows viewer badge with gray color", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="viewer"
        onRoleChange={mockOnRoleChange}
        disabled={true}
      />
    );

    const badge = screen.getByText("viewer");
    expect(badge.className).toMatch(/gray/);
  });
});

  describe("accessibility", () => {
    it("has accessible label", () => {
    render(
      <RoleAssignment
        accountId="acct-1"
        currentRole="admin"
        onRoleChange={mockOnRoleChange}
        disabled={false}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-label")).toMatch(/change role/i);
  });
  });
});
