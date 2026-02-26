import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import type { RealmDetail } from "@/types";

const api = new ApiClient();

/**
 * Realm detail page for viewing and managing a single realm.
 * Only accessible to SysAdmins.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [realm, setRealm] = useState<RealmDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get realm ID from URL
  const realmId = window.location.pathname.split("/").pop();

  // Fetch realm details
  useEffect(() => {
    if (!isAuthenticated || !session?.is_sysadmin || !realmId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRealm(realmId)
      .then(setRealm)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load realm"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session, realmId]);

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view realm details.
      </div>
    );
  }

  // Not a sysadmin
  if (!session?.is_sysadmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p className="text-slate-400">
          Only system administrators can access this page.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading realm details...
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

  // Realm not found
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{realm.name}</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">
            ID: {realm.realm_id}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1 text-sm font-medium ${
            realm.status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {realm.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Members</p>
          <p className="text-2xl font-bold text-white">{realm.members.length}</p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Created</p>
          <p className="text-lg font-medium text-white">
            {new Date(realm.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Status</p>
          <p className="text-lg font-medium text-white capitalize">{realm.status}</p>
        </div>
      </div>

      {/* Members List */}
      {/* Members List */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Members</h2>
        {realm.members.length === 0 ? (
          <p className="text-slate-400">No members</p>
        ) : (
          <div className="space-y-2">
            {realm.members.map((member) => (
              <div
                key={member.account_id}
                className="flex items-center justify-between py-2 px-3 bg-slate-700/50"
              >
                <span className="text-white font-medium">{member.username}</span>
                <span
                  className={`text-xs px-2 py-0.5 ${
                    member.role === "owner"
                      ? "bg-purple-500/20 text-purple-400"
                      : member.role === "admin"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}