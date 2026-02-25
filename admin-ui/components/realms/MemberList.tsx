import type { RealmMember } from "@/types";
import { RoleAssignment } from "./RoleAssignment";

interface MemberListProps {
  members: RealmMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange: (accountId: string, newRole: string) => void;
}

/**
 * MemberList displays a table of realm members with their roles.
 * Allows admins to change member roles via dropdown.
 */
export function MemberList({
  members,
  currentUserId,
  isAdmin,
  onRoleChange,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No members in this realm.
      </div>
    );
  }

  return (
    <table className="w-full" role="table">
      <thead>
        <tr className="border-b border-slate-700">
          <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
            Username
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
            Role
          </th>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
