import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import { AccountTable } from "@/components/accounts/AccountTable";
import type { AccountListEntry } from "@/types";

const api = new ApiClient();

/**
 * Accounts list page for system administrators.
 * Only accessible to SysAdmins.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<AccountListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts
  useEffect(() => {
    if (!isAuthenticated || !session?.is_sysadmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getAccounts()
      .then(setAccounts)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load accounts"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle viewing account details
  const handleViewAccount = (accountId: string) => {
    // Navigate to account details page
    window.location.href = `/ui/admin/accounts/${accountId}`;
  };

  // Handle suspending/unsuspending account
  const handleSuspendAccount = async (accountId: string, suspend: boolean) => {
    try {
      await api.suspendAccount({
        id: accountId,
        suspend,
      });

      // Update local state
      setAccounts(
        accounts.map((a) =>
          a.account_id === accountId
            ? { ...a, status: suspend ? "suspended" : "active" }
            : a
        )
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Failed to ${suspend ? "suspend" : "unsuspend"} account`
      );
    }
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view accounts.
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
        Loading accounts...
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
      <div>
        <h1 className="text-2xl font-bold text-white">Accounts</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage user accounts
        </p>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-800 p-6">
        <AccountTable
          accounts={accounts}
          onViewAccount={handleViewAccount}
          onSuspendAccount={handleSuspendAccount}
        />
      </div>
    </div>
  );
}