import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import { RealmSelector } from "@/components/RealmSelector/RealmSelector";
import { Dialog } from "@/components/Dialog/Dialog";
import type { RuneListItem, RuneFilters } from "@/types";
import "./+Page.css";

/**
 * Runes list page for viewing and managing runes.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm, setRealm } = useRealm();
  const { show } = useToast();

  const [runes, setRunes] = useState<RuneListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [runeToDelete, setRuneToDelete] = useState<string | null>(null);

  // Sync realm with API
  useEffect(() => {
    api.setRealm(selectedRealm);
  }, [selectedRealm]);

  // Fetch runes
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const filters: RuneFilters = {};
    if (statusFilter !== "all") {
      filters.status = statusFilter as RuneListItem["status"];
    }

    api
      .getRunes(filters)
      .then(setRunes)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load runes");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session, statusFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Handle delete button click
  const handleDeleteClick = (runeId: string) => {
    setRuneToDelete(runeId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!runeToDelete) return;

    try {
      await api.shatterRune(runeToDelete);
      setRunes((prev) => prev.filter((r) => r.id !== runeToDelete));
      show({
        type: "success",
        title: "Rune deleted",
        description: "The rune has been deleted successfully.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to delete rune",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRuneToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRuneToDelete(null);
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
      <div className="runes-page-not-authenticated">
        <TopNav />
        <div className="runes-page-login-prompt">
          <p>Please log in to view runes.</p>
          <a href="/login" className="runes-page-login-link">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="runes-page">
        <TopNav />
        <div className="runes-page-loading">
          <p>Loading runes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="runes-page">
        <TopNav />
        <div className="runes-page-error">
          <h2 className="runes-page-error-title">Error</h2>
          <p className="runes-page-error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="runes-page-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="runes-page">
      <TopNav />
      <div className="runes-page-container">
        {/* Header */}
        <div className="runes-page-header">
          <div className="runes-page-title-section">
            <h1 className="runes-page-title">Runes</h1>
            <p className="runes-page-count">
              {runes.length} rune{runes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="runes-page-controls">
            <RealmSelector />
          </div>
        </div>

        {/* Filters */}
        <div className="runes-page-filters">
          <div className="runes-page-filter-group">
            <label htmlFor="status-filter" className="runes-page-filter-label">
              Status
            </label>
            <select
              id="status-filter"
              className="runes-page-filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="claimed">Claimed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="sealed">Sealed</option>
              <option value="shattered">Shattered</option>
            </select>
          </div>
        </div>

        {/* Runes Table */}
        {runes.length === 0 ? (
          <div className="runes-page-empty">
            <p className="runes-page-empty-message">No runes found</p>
          </div>
        ) : (
          <div className="runes-page-table-container">
            <table className="runes-table">
              <thead>
                <tr>
                  <th className="runes-table-header runes-table-header-title">
                    Title
                  </th>
                  <th className="runes-table-header">Status</th>
                  <th className="runes-table-header">Priority</th>
                  <th className="runes-table-header">Claimant</th>
                  <th className="runes-table-header">Created</th>
                  <th className="runes-table-header">Updated</th>
                  <th className="runes-table-header runes-table-header-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {runes.map((rune) => (
                  <tr key={rune.id} className="runes-table-row">
                    <td className="runes-table-cell runes-table-cell-title">
                      {rune.title}
                    </td>
                    <td className="runes-table-cell">
                      <span className={`runes-status runes-status-${rune.status}`}>
                        {rune.status}
                      </span>
                    </td>
                    <td className="runes-table-cell runes-table-cell-priority">
                      {rune.priority}
                    </td>
                    <td className="runes-table-cell runes-table-cell-claimant">
                      {rune.claimant || "-"}
                    </td>
                    <td className="runes-table-cell runes-table-cell-date">
                      {formatDate(rune.created_at)}
                    </td>
                    <td className="runes-table-cell runes-table-cell-date">
                      {formatDate(rune.updated_at)}
                    </td>
                    <td className="runes-table-cell runes-table-cell-actions">
                      <button
                        className="runes-delete-button"
                        onClick={() => handleDeleteClick(rune.id)}
                        aria-label={`Delete rune ${rune.title}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          title="Delete rune"
          description={
            runeToDelete
              ? `Are you sure you want to delete this rune? This action cannot be undone.`
              : "Are you sure you want to delete this rune?"
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          themeColor="var(--color-amber)"
        />
      </div>
    </div>
  );
}
