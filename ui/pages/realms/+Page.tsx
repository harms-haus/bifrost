import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import { RealmSelector } from "@/components/RealmSelector/RealmSelector";
import { Dialog } from "@/components/Dialog/Dialog";
import type { RealmListEntry } from "@/types";
import "./+Page.css";

/**
 * Realms list page for viewing and managing realms.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm, role, availableRealms, setRealm } = useRealm();
  const { show } = useToast();

  const [realms, setRealms] = useState<RealmListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [realmToDelete, setRealmToDelete] = useState<string | null>(null);

  // Sync realm with API
  useEffect(() => {
    api.setRealm(selectedRealm);
  }, [selectedRealm]);

  // Fetch realms
  useEffect(() => {
    if (!isAuthenticated || !session || !session.is_sysadmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRealms([]); // Clear realms when starting to fetch

    setError(null);

    api
      .getRealms()
      .then((data) => {
        // Filter out _admin realm
        const filteredRealms = data.filter((r) => r.realm_id !== "_admin");
        setRealms(filteredRealms);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load realms");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Filter realms based on status filter
  const filteredRealms = realms.filter((realm) => {
    if (statusFilter === "all") return true;
    return realm.status === statusFilter;
  });

  // Handle delete button click (suspend realm)
  const handleDeleteClick = (realmId: string) => {
    setRealmToDelete(realmId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete (suspend realm)
  const handleConfirmDelete = async () => {
    if (!realmToDelete) return;

    try {
      await api.suspendRealm({ realm_id: realmToDelete, reason: "Suspended via UI" });
      setRealms((prev) => prev.filter((r) => r.realm_id !== realmToDelete));
      show({
        type: "success",
        title: "Realm suspended",
        description: "The realm has been suspended successfully.",
      });
  const handleConfirmDelete = async () => {
    if (!realmToDelete) return;

    try {
      // Note: suspendRealm would be implemented when backend endpoint is available
      // For now, we'll just remove from local state to simulate deletion
      setRealms((prev) => prev.filter((r) => r.realm_id !== realmToDelete));
      show({
        type: "success",
        title: "Realm suspended",
        description: "The realm has been suspended successfully.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to suspend realm",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRealmToDelete(null);
    }
  };

  // Cancel delete
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRealmToDelete(null);
  };

  // Get realm to suspend for dialog
  const getRealmToSuspend = () => {
    if (!realmToDelete) return null;
    return realms.find((r) => r.realm_id === realmToDelete) || null;
  };

  const realmToSuspend = getRealmToSuspend();

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
  const formatDate = (dateString: string) => {
  // Format date for display
    setDeleteDialogOpen(false);
    setRealmToDelete(null);
  };

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
      <div className="realms-page-not-authenticated">
        <TopNav />
        <div className="realms-page-login-prompt">
          <p>Please log in to view realms.</p>
          <a href="/login" className="realms-page-login-link">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // Not a sysadmin
  if (!session.is_sysadmin) {
    return (
      <div className="realms-page-not-authenticated">
        <TopNav />
        <div className="realms-page-login-prompt">
          <p>Only system administrators can view all realms.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="realms-page">
        <TopNav />
        <div className="realms-page-loading">
          <p>Loading realms...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="realms-page">
        <TopNav />
        <div className="realms-page-error">
          <h2 className="realms-page-error-title">Error</h2>
          <p className="realms-page-error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="realms-page-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredRealms.length === 0) {
    return (
      <div className="realms-page">
        <TopNav />
        <div className="realms-page-empty">
          <h2 className="realms-page-empty-title">No Realms Found</h2>
          <p className="realms-page-empty-message">
            {statusFilter === "all"
              ? "No realms have been created yet."
              : `No ${statusFilter} realms found.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="realms-page">
      <TopNav />

      <div className="realms-page-container">
        {/* Header */}
        <div className="realms-page-header">
          <h1 className="realms-page-title">Realms</h1>
          <p className="realms-page-subtitle">
            Manage all realms in the system
          </p>
        </div>

        {/* Filters */}
        <div className="realms-page-filters">
          <div className="realms-page-filter-group">
            <label className="realms-page-filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="realms-page-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="realms-page-filter-group">
            <label className="realms-page-filter-label">Current Realm</label>
            <RealmSelector />
          </div>
        </div>

        {/* Realms Grid */}
        <div className="realms-page-grid">
          {filteredRealms.map((realm) => (
            <div key={realm.realm_id} className="realms-page-card">
              <div className="realms-page-card-header">
                <h3 className="realms-page-card-name">{realm.name}</h3>
                <span
                  className={`realms-page-card-status realms-page-card-status-${realm.status}`}
                >
                  {realm.status}
                </span>
              </div>

              <div className="realms-page-card-body">
                <div className="realms-page-card-field">
                  <span className="realms-page-card-field-label">ID:</span>
                  <span className="realms-page-card-field-value">
                    {realm.realm_id}
                  </span>
                </div>

                <div className="realms-page-card-field">
                  <span className="realms-page-card-field-label">Created:</span>
                  <span className="realms-page-card-field-value">
                    {formatDate(realm.created_at)}
                  </span>
                </div>
              </div>

              <div className="realms-page-card-actions">
                <button
                  onClick={() => handleDeleteClick(realm.realm_id)}
                  className="realms-page-delete-button"
                >
                {realm.status === "suspended" ? "Reactivate" : "Suspend"}
                </button>
              </div>
              </div>
                </button>
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Dialog */}
        <Dialog
          isOpen={deleteDialogOpen}
          title={realmToSuspend?.status === "suspended" ? "Reactivate Realm" : "Suspend Realm"}
          description="Are you sure you want to suspend this realm? This will prevent all operations within the realm."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          themeColor="var(--color-green)"
          confirmText={realmToSuspend?.status === "suspended" ? "Reactivate" : "Suspend"}
        />
        <Dialog
          isOpen={deleteDialogOpen}
          title={realmToDelete && realms.find(r => r.realm_id === realmToDelete)?.status === "suspended" ? "Reactivate Realm" : "Suspend Realm"}
          description="Are you sure you want to suspend this realm? This will prevent all operations within the realm."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          themeColor="var(--color-green)"
          confirmText={realmToDelete && realms.find(r => r.realm_id === realmToDelete)?.status === "suspended" ? "Reactivate" : "Suspend"}
        />
          isOpen={deleteDialogOpen}
          title="Suspend Realm"
          description="Are you sure you want to suspend this realm? This will prevent all operations within the realm."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          themeColor="var(--color-green)"
          confirmText="Suspend Realm"
        />
      </div>
    </div>
  );
}
