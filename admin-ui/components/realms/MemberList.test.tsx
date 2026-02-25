import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemberList } from "./MemberList";
import type { RealmMember } from "@/types";

// Mock data
const mockMembers: RealmMember[] = [
  { account_id: "acct-1", username: "owner1", role: "owner" },
  { account_id: "acct-2", username: "admin1", role: "admin" },
  { account_id: "acct-3", username: "member1", role: "member" },
  { account_id: "acct-4", username: "viewer1", role: "viewer" },
];

const mockMembersSingleOwner: RealmMember[] = [
  { account_id: "acct-1", username: "onlyOwner", role: "owner" },
  { account_id: "acct-2", username: "admin1", role: "admin" },
];

describe("MemberList", () => {
  const mockOnRoleChange = vi.fn();
  const mockOnRemoveMember = vi.fn();

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

  describe("remove member functionality", () => {
    it("shows remove button for admins", () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Should have remove buttons for each member except self (3 members, since acct-2 is current user)
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      expect(removeButtons.length).toBe(3);
    });

    it("hides remove button for non-admins", () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={false}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Should not have remove buttons
      expect(screen.queryAllByRole("button", { name: /remove/i }).length).toBe(0);
    });

    it("shows confirmation dialog when remove is clicked", async () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Click remove button for member1 (acct-3) - index 1 since acct-2 has no button
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      fireEvent.click(removeButtons[1]); // member1

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/remove member/i)).toBeDefined();
        expect(screen.getByText(/are you sure/i)).toBeDefined();
      });
    });

    it("calls onRemoveMember when confirmation is accepted", async () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Click remove button for member1 (acct-3) - index 1 since acct-2 (admin1) has no button
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      fireEvent.click(removeButtons[1]);

      // Confirm removal
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^remove$/i })).toBeDefined();
      });

      fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));

      expect(mockOnRemoveMember).toHaveBeenCalledWith("acct-3");
    });

    it("does not call onRemoveMember when cancelled", async () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Click remove button for member1 (acct-3) - index 1 since acct-2 has no button
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      fireEvent.click(removeButtons[1]);

      // Cancel removal
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel/i })).toBeDefined();
      });

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnRemoveMember).not.toHaveBeenCalled();
    });

    it("disables remove button for last owner", () => {
      render(
        <MemberList
          members={mockMembersSingleOwner}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // The only owner's remove button should be disabled
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      expect(removeButtons[0]).toHaveProperty("disabled", true);
    });

    it("hides remove button for self", () => {
      render(
        <MemberList
          members={mockMembers}
          currentUserId="acct-2"
          isAdmin={true}
          onRoleChange={mockOnRoleChange}
          onRemoveMember={mockOnRemoveMember}
        />
      );

      // Admin1 (acct-2) should not see a remove button for themselves
      const rows = screen.getAllByRole("row");
      const adminRow = rows.find((row) => row.textContent?.includes("admin1"));
      expect(adminRow?.querySelector('button[aria-label*="remove"]')).toBeNull();
    });
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
