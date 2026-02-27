import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import { RealmSelector } from "@/components/RealmSelector/RealmSelector";
import type { AccountListEntry } from "@/types";
import "./+Page.css";

/**
 * Accounts list page for viewing and managing user accounts.
 * Only accessible to system administrators.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm, role, availableRealms, setRealm } = useRealm();

  const [accounts, setAccounts] = useState<AccountListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [realmFilter, setRealmFilter] = useState<string | null>(null);

  // Sync realm with API
  useEffect(() => {
    api.setRealm(selectedRealm);
  }, [selectedRealm]);

  // Fetch accounts
  useEffect(() => {
    if (!isAuthenticated || !session || !session.is_sysadmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAccounts([]); // Clear accounts when starting to fetch

    api
      .getAccounts()
      .then((data) => {
        setAccounts(data);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load accounts");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Handle realm filter change
  const handleRealmFilterChange = (realm: string | null) => {
    setRealmFilter(realm);
  };

  // Filter accounts based on filters
  const filteredAccounts = accounts.filter((account) => {
    // Status filter
    if (statusFilter !== "all" && account.status !== statusFilter) {
      return false;
    }

    // Realm filter
    if (realmFilter && !account.realms.includes(realmFilter)) {
      return false;
    }

    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="accounts-page-not-authenticated">
        <TopNav />
        <div className="accounts-page-login-prompt">
          <p>Please log in to view accounts.</p>
          <a href="/login" className="accounts-page-login-link">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // Not a sysadmin
  if (!session.is_sysadmin) {
    return (
      <div className="accounts-page-not-authenticated">
        <TopNav />
        <div className="accounts-page-error">
          <h2 className="accounts-page-error-title">Access Denied</h2>
          <p className="accounts-page-error-message">
            Only system administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="accounts-page-loading">
        <TopNav />
        <p>Loading accounts...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="accounts-page-error">
        <TopNav />
        <div className="accounts-page-error-content">
          <h2 className="accounts-page-error-title">Error</h2>
          <p className="accounts-page-error-message">{error}</p>
          <button
            className="accounts-page-retry-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <TopNav />

      <div className="accounts-page-content">
        {/* Header */}
        <div className="accounts-page-header">
          <h1 className="accounts-page-title">Accounts</h1>
          <p className="accounts-page-subtitle">
            Manage user accounts across all realms
          </p>
        </div>

        {/* Filters */}
        <div className="accounts-page-filters">
          <div className="accounts-page-filter">
            <label htmlFor="status-filter" className="accounts-page-filter-label">
              Status
            </label>
            <select
              id="status-filter"
              className="accounts-page-filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="accounts-page-filter">
            <label htmlFor="realm-filter" className="accounts-page-filter-label">
              Realm
            </label>
            <select
              id="realm-filter"
              className="accounts-page-filter-select"
              value={realmFilter || ""}
              onChange={(e) => handleRealmFilterChange(e.target.value || null)}
            >
              <option value="">All Realms</option>
              {availableRealms.map((realm) => (
                <option key={realm} value={realm}>
                  {realm}
                </option>
              ))}
            </select>
          </div>

          <div className="accounts-page-realm-selector">
            <label className="accounts-page-filter-label">Current Realm</label>
            <RealmSelector />
          </div>
        </div>

        {/* Empty State */}
        {filteredAccounts.length === 0 ? (
          <div className="accounts-page-empty">
            <p>No accounts found matching the current filters.</p>
          </div>
        ) : (
          /* Accounts Table */
          <div className="accounts-page-table-container">
            <table className="accounts-page-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Realms</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.account_id}>
                    <td className="accounts-page-username">
                      {account.username}
                    </td>
                    <td className="accounts-page-realms">
                      {account.realms.length > 0
                        ? account.realms.join(", ")
                        : "None"}
                    </td>
                    <td className="accounts-page-status">
                      <span
                        className={`accounts-page-status-badge accounts-page-status-badge-${account.status}`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="accounts-page-created">
                      {formatDate(account.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
