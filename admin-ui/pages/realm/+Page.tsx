import { useState, useEffect } from "react";
import { useAuth, useRealm } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import { MemberList } from "@/components/realms/MemberList";
import type { RealmDetail } from "@/types";

const api = new ApiClient();

/**
 * Realm settings page for managing realm members and roles.
 * Only accessible to realm admins/owners.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm, role } = useRealm();
  const [realm, setRealm] = useState<RealmDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Check if user is realm admin or owner (or sysadmin)
  const isAdmin =
    role === "admin" || role === "owner" || (session?.is_sysadmin ?? false);

  // Fetch realm details
  useEffect(() => {
    if (!isAuthenticated || !selectedRealm) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRealm(selectedRealm)
      .then(setRealm)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load realm"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, selectedRealm]);

  // Handle role change for a member
  const handleRoleChange = async (accountId: string, newRole: string) => {
    if (!selectedRealm || !realm) return;

    try {
      await api.assignRole({
        account_id: accountId,
        realm_id: selectedRealm,
        role: newRole,
      });

      // Update local state
      setRealm({
        ...realm,
        members: realm.members.map((m) =>
          m.account_id === accountId ? { ...m, role: newRole } : m
        ),
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update role"
      );
    }
  };

  // Handle adding a new member
  const handleAddMember = async () => {
    if (!selectedRealm || !realm || !newUsername.trim()) {
      setAddMemberError("Please enter a username");
      return;
    }

    setIsAddingMember(true);
    setAddMemberError(null);

    try {
      // First grant realm access
      await api.grantRealm({
        account_id: newUsername.trim(),
        realm_id: selectedRealm,
      });

      // Then assign the default role (member)
      await api.assignRole({
        account_id: newUsername.trim(),
        realm_id: selectedRealm,
        role: "member",
      });

      // Refresh realm data
      const updatedRealm = await api.getRealm(selectedRealm);
      setRealm(updatedRealm);
      setNewUsername("");
    } catch (err) {
      if (err instanceof ApiError) {
        setAddMemberError(err.message || "Failed to add member");
      } else {
        setAddMemberError("Failed to add member");
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (accountId: string) => {
    if (!selectedRealm || !realm) return;

    try {
      await api.revokeRealm({
        account_id: accountId,
        realm_id: selectedRealm,
      });

      // Update local state
      setRealm({
        ...realm,
        members: realm.members.filter((m) => m.account_id !== accountId),
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to remove member"
      );
    }
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view realm settings.
      </div>
    );
  }

  // No realm selected
  if (!selectedRealm) {
    return (
      <div className="text-slate-400 text-center py-8">
        No realm selected. Please select a realm from the navigation bar.
      </div>
    );
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p className="text-slate-400">
          Only realm admins and owners can access this page.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading realm settings...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[var(--page-color)] hover:opacity-90 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // No realm data
  if (!realm) {
    return (
      <div className="text-slate-400 text-center py-8">
        Realm not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{realm.name}</h1>
        <p className="text-slate-400 text-sm font-mono mt-1">
          ID: {realm.realm_id}
        </p>
      </div>

      {/* Members Section */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Members</h2>

        {/* Add Member Form */}
        {isAdmin && (
          <div className="mb-6 pb-6 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Add New Member
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-2 focus:outline-[var(--page-color)] focus:outline-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddMember();
                  }
                }}
              />
              <button
                onClick={handleAddMember}
                disabled={isAddingMember || !newUsername.trim()}
                className="px-4 py-2 bg-[var(--page-color)] hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {isAddingMember ? "Adding..." : "Add Member"}
              </button>
            </div>
            {addMemberError && (
              <p className="text-red-400 text-sm mt-2">{addMemberError}</p>
            )}
          </div>
        )}

        {/* Member List */}
        <MemberList
          members={realm.members}
          currentUserId={session.account_id}
          isAdmin={isAdmin}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  );
}
