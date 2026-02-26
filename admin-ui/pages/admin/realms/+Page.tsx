import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import { RealmTable } from "@/components/realms/RealmTable";
import type { RealmListEntry } from "@/types";

const api = new ApiClient();

/**
 * Realms list page for system administrators.
 * Only accessible to SysAdmins.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [realms, setRealms] = useState<RealmListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRealmName, setNewRealmName] = useState("");

  // Fetch realms
  useEffect(() => {
    if (!isAuthenticated || !session?.is_sysadmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRealms()
      .then(setRealms)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load realms"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle viewing realm details
  const handleViewRealm = (realmId: string) => {
    window.location.href = `/ui/admin/realms/${realmId}`;
  };

  // Handle creating a new realm
  const handleCreateRealm = async () => {
    if (!newRealmName.trim()) return;

    try {
      const newRealm = await api.createRealm({ name: newRealmName.trim() });
      setRealms([...realms, newRealm]);
      setShowCreateModal(false);
      setNewRealmName("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create realm"
      );
    }
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view realms.
      </div>
    );
  }

  // Not a sysadmin
  if (!session.is_sysadmin) {
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
        Loading realms...
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Realms</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage realms
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[var(--page-color)] hover:opacity-90 text-white text-sm font-medium"
        >
          Create Realm
        </button>
      </div>

      {/* Realms Table */}
      {/* Realms Table */}
      <div className="bg-slate-800 p-6">
        <RealmTable
          realms={realms}
          onViewRealm={handleViewRealm}
        />
      </div>

      {/* Create Realm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">
              Create New Realm
            </h2>
            <input
              type="text"
              value={newRealmName}
              onChange={(e) => setNewRealmName(e.target.value)}
              placeholder="Realm name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--page-color)]"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRealmName("");
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRealm}
                disabled={!newRealmName.trim()}
                className="px-4 py-2 bg-[var(--page-color)] hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
