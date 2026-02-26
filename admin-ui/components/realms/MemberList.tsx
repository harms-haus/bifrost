import { useState } from "react";
import type { RealmMember } from "@/types";
import { RoleAssignment } from "./RoleAssignment";

interface MemberListProps {
  members: RealmMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange: (accountId: string, newRole: string) => void;
  onRemoveMember?: (accountId: string) => void;
}

/**
 * MemberList displays a table of realm members with their roles.
 * Allows admins to change member roles via dropdown and remove members.
 */
export function MemberList({
  members,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemoveMember,
}: MemberListProps) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // Count owners to prevent removing the last one
  const ownerCount = members.filter((m) => m.role === "owner").length;

  if (!members || members.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No members in this realm.
      </div>
    );
  }

  const handleRemoveClick = (accountId: string) => {
    setConfirmRemove(accountId);
  };

  const handleConfirmRemove = () => {
    if (confirmRemove && onRemoveMember) {
      onRemoveMember(confirmRemove);
    }
    setConfirmRemove(null);
  };

  const handleCancelRemove = () => {
    setConfirmRemove(null);
  };

  return (
    <>
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
              Username
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
              Role
            </th>
            {isAdmin && onRemoveMember && (
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400 w-24">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.account_id}
              className="border-b border-slate-700/50 hover:bg-slate-800/50"
            >
              <td className="py-3 px-4">
                <span className="text-white font-medium">{member.username}</span>
                {member.account_id === currentUserId && (
                  <span className="ml-2 text-xs text-slate-400">(you)</span>
                )}
              </td>
              <td className="py-3 px-4">
                <RoleAssignment
                  accountId={member.account_id}
                  currentRole={member.role}
                  onRoleChange={onRoleChange}
                  disabled={!isAdmin}
                />
              </td>
              {isAdmin && onRemoveMember && (
                <td className="py-3 px-4">
                  {member.account_id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveClick(member.account_id)}
                      disabled={member.role === "owner" && ownerCount <= 1}
                      aria-label={`Remove ${member.username}`}
                      className="text-red-400 hover:text-red-300 disabled:text-slate-600 disabled:cursor-not-allowed text-sm"
                    >
                      Remove
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Remove Member
            </h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to remove this member from the realm?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelRemove}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
