import { useState } from "react";
import { Select } from "@/theme";

const ROLE_OPTIONS = [
  { value: "owner", label: "owner" },
  { value: "admin", label: "admin" },
  { value: "member", label: "member" },
  { value: "viewer", label: "viewer" },
] as const;

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-600 text-white",
  admin: "bg-blue-600 text-white",
  member: "bg-green-600 text-white",
  viewer: "bg-gray-600 text-white",
};

interface RoleAssignmentProps {
  accountId: string;
  currentRole: string;
  onRoleChange: (accountId: string, newRole: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * RoleAssignment provides a dropdown for changing a member's role.
 * Falls back to a static badge when disabled.
 */
export function RoleAssignment({
  accountId,
  currentRole,
  onRoleChange,
  disabled = false,
  isLoading = false,
}: RoleAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[currentRole] || "bg-gray-600 text-white"}`}
      >
        {currentRole}
      </span>
    );
  }

  const handleRoleChange = (newRole: string | null) => {
    if (newRole && newRole !== currentRole) {
      onRoleChange(accountId, newRole);
    }
    setIsOpen(false);
  };

  return (
    <Select.Root
      value={currentRole}
      onValueChange={handleRoleChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={isLoading}
    >
      <Select.Trigger
        className="inline-flex items-center justify-between gap-2 min-w-[6rem] px-2 py-1 text-xs font-medium cursor-pointer transition-colors bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--border)] focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        aria-label="Change role"
      >
        <Select.Value />
        <Select.Icon className="text-xs">▼</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup className="bg-[var(--bg-secondary)] border border-[var(--border)] py-1 shadow-lg max-h-64 overflow-y-auto origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 z-50">
            {ROLE_OPTIONS.map((option) => (
              <Select.Item key={option.value} item={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
