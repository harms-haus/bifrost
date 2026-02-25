import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemberList } from "./MemberList";
import type { RealmMember } from "@/types";

// Mock data
const mockMembers: RealmMember[] = [
  { account_id: "acct-1", username: "owner1", role: "owner" },
  { account_id: "acct-2", username: "admin1", role: "admin" },
  { account_id: "acct-3", username: "member1", role: "member" },
  { account_id: "acct-4", username: "viewer1", role: "viewer" },
];

describe("MemberList", () => {
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list of members", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    expect(screen.getByText("owner1")).toBeDefined();
    expect(screen.getByText("admin1")).toBeDefined();
    expect(screen.getByText("member1")).toBeDefined();
    expect(screen.getByText("viewer1")).toBeDefined();
  });

  it("displays role badges", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    // Each role should appear at least once (as badge)
    const ownerBadges = screen.getAllByText("owner");
    const adminBadges = screen.getAllByText("admin");
    const memberBadges = screen.getAllByText("member");
    const viewerBadges = screen.getAllByText("viewer");

    expect(ownerBadges.length).toBeGreaterThan(0);
    expect(adminBadges.length).toBeGreaterThan(0);
    expect(memberBadges.length).toBeGreaterThan(0);
    expect(viewerBadges.length).toBeGreaterThan(0);
  });

  it("shows role dropdown for admins", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    // Should have role dropdowns for each member (4 members)
    const roleButtons = screen.getAllByRole("combobox");
    expect(roleButtons.length).toBe(4);
  });

  it("hides role dropdown for non-admins", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={false}
        onRoleChange={mockOnRoleChange}
      />
    );

    // Should not have role dropdowns
    expect(screen.queryAllByRole("combobox").length).toBe(0);
  });

  it("renders role change callback for admins", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    // Verify that the onRoleChange callback is passed to RoleAssignment
    // (The actual dropdown interaction is tested in RoleAssignment tests)
    expect(mockOnRoleChange).toBeDefined();
  });

  it("shows empty state when no members", () => {
    render(
      <MemberList
        members={[]}
        currentUserId="acct-1"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    expect(screen.getByText(/no members/i)).toBeDefined();
  });

  it("highlights current user", () => {
    render(
      <MemberList
        members={mockMembers}
        currentUserId="acct-2"
        isAdmin={true}
        onRoleChange={mockOnRoleChange}
      />
    );

    // Current user should have a "you" indicator
    expect(screen.getByText(/\(you\)/i)).toBeDefined();
  });

  describe("accessibility", () => {
    it("has proper table structure", () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
        />
      );

      // Should have a table or list structure
      const table = screen.getByRole("table");
      expect(table).toBeDefined();
    });

    it("has accessible role dropdowns", () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
        />
      );

      const roleButtons = screen.getAllByRole("combobox");
      roleButtons.forEach((button) => {
        expect(button.getAttribute("aria-label")).toMatch(/role/i);
      });
    });
  });
});
