import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import type { AccountDetail } from "@/types";

const api = new ApiClient();

/**
 * Account detail page for viewing and managing a single account.
 * Only accessible to SysAdmins.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPat, setNewPat] = useState<string | null>(null);

  // Get account ID from URL
  const accountId = window.location.pathname.split("/").pop();

  // Fetch account details
  useEffect(() => {
    if (!isAuthenticated || !session?.is_sysadmin || !accountId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getAccount(accountId)
      .then(setAccount)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load account"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session, accountId]);

  // Handle suspend/unsuspend - API toggles suspension status
  const handleSuspend = async () => {
    if (!account) return;

    try {
      await api.suspendAccount({
        id: account.account_id,
      });

      // Update local state
      setAccount({
        ...account,
        status: account.status === "active" ? "suspended" : "active",
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to update account status"
      );
    }
  };

  // Handle creating PAT
  const handleCreatePat = async () => {
    if (!account) return;

    try {
      const result = await api.createPat({
        account_id: account.account_id,
        name: `PAT ${new Date().toISOString()}`,
      });

      setNewPat(result.pat);
      // Refresh account data
      const updated = await api.getAccount(account.account_id);
      setAccount(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create PAT"
      );
    }
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view account details.
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
        Loading account details...
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

  // Account not found
  // Account not found
  if (!account) {
    return (
      <div className="text-slate-400 text-center py-8">
        Account not found.
      </div>
    );
  }

  // Check if viewing own account
  const isOwnAccount = session?.account_id === account.account_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{account.username}</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">
            ID: {account.account_id}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Status Badge */}
          <span
            className={`inline-block px-3 py-1 text-sm font-medium ${
              account.status === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {account.status}
          </span>

          {/* Suspend Button (not for own account) */}
          {!isOwnAccount && (
            <button
              onClick={() => handleSuspend(account.status !== "suspended")}
              className={`px-3 py-1 text-sm font-medium ${
                account.status === "active"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {account.status === "active" ? "Suspend" : "Unsuspend"}
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Realms</p>
          <p className="text-2xl font-bold text-white">{account.realms.length}</p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">PATs</p>
          <p className="text-2xl font-bold text-white">{account.pat_count}</p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Created</p>
          <p className="text-lg font-medium text-white">
            {new Date(account.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Realm Memberships */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Realm Memberships</h2>
        {account.realms.length === 0 ? (
          <p className="text-slate-400">No realm memberships</p>
        ) : (
          <div className="space-y-2">
            {account.realms.map((realmId) => (
              <div
                key={realmId}
                className="flex items-center justify-between py-2 px-3 bg-slate-700/50"
              >
                <span className="text-white font-medium">{realmId}</span>
                <span
                  className={`text-xs px-2 py-0.5 ${
                    account.roles[realmId] === "owner"
                      ? "bg-purple-500/20 text-purple-400"
                      : account.roles[realmId] === "admin"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {account.roles[realmId]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAT Management */}
      <div className="bg-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Personal Access Tokens</h2>
          <button
            onClick={handleCreatePat}
            className="px-3 py-1 text-sm bg-[var(--page-color)] hover:opacity-90 text-white"
          >
            Create PAT
          </button>
        </div>
        {newPat && (
          <div className="bg-green-500/10 border border-green-500 p-3 mb-4">
            <p className="text-green-400 text-sm font-medium">
              New PAT created. Copy it now (it won't be shown again):
            </p>
            <code className="block bg-slate-900 p-2 text-green-300 text-sm font-mono">
              {newPat}
            </code>
          </div>
        )}
        <p className="text-slate-400 text-sm">
          {account.pat_count} active token{account.pat_count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
