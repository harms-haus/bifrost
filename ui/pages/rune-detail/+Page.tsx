import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import { Dialog } from "@/components/Dialog/Dialog";
import type { RuneDetail } from "@/types";
import { useNavigate } from "react-router-dom";
import "./+Page.css";

/**
 * Rune detail page showing full rune information with AMBER theme.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm } = useRealm();
  const { show } = useToast();
  const navigate = useNavigate();

  const [rune, setRune] = useState<RuneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seal dialog state
  const [sealDialogOpen, setSealDialogOpen] = useState(false);

  // Get rune ID from URL search params
  const getRuneId = (): string | null => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  };

  // Sync realm with API
  useEffect(() => {
    api.setRealm(selectedRealm);
  }, [selectedRealm]);

  // Fetch rune details
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    const runeId = getRuneId();
    if (!runeId) {
      setError("Rune ID not found in URL");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRune(runeId)
      .then((data) => {
        setRune(data);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load rune");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle back button
  const handleBack = () => {
    navigate("/runes");
  };

  // Handle edit button
  const handleEdit = () => {
    const runeId = getRuneId();
    if (runeId) {
      navigate(`/rune/${runeId}/edit`);
    }
  };

  // Handle forge action
  const handleForge = async () => {
    if (!rune) return;

    try {
      await api.forgeRune(rune.id);
      // Refetch rune to get updated status
      const updatedRune = await api.getRune(rune.id);
      setRune(updatedRune);
      show({
        type: "success",
        title: "Rune forged",
        description: "The rune has been moved from draft to open.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to forge rune",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  // Handle fulfill action
  const handleFulfill = async () => {
    if (!rune) return;

    try {
      await api.fulfillRune(rune.id);
      // Refetch rune to get updated status
      const updatedRune = await api.getRune(rune.id);
      setRune(updatedRune);
      show({
        type: "success",
        title: "Rune fulfilled",
        description: "The rune has been marked as fulfilled.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to fulfill rune",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  // Handle seal button click
  const handleSealClick = () => {
    setSealDialogOpen(true);
  };

  // Confirm seal
  const handleConfirmSeal = async () => {
    if (!rune) return;

    try {
      await api.sealRune(rune.id);
      // Refetch rune to get updated status
      const updatedRune = await api.getRune(rune.id);
      setRune(updatedRune);
      show({
        type: "success",
        title: "Rune sealed",
        description: "The rune has been closed.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to seal rune",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setSealDialogOpen(false);
    }
  };

  // Cancel seal
  const handleCancelSeal = () => {
    setSealDialogOpen(false);
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="rune-detail-not-authenticated">
        <TopNav />
        <div className="rune-detail-login-prompt">
          <p>Please log in to view rune details.</p>
          <a href="/login" className="rune-detail-login-link">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rune-detail-loading">
        <TopNav />
        <div className="rune-detail-loading-container">
          <p>Loading rune details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rune-detail-error">
        <TopNav />
        <div className="rune-detail-error-container">
          <h2 className="rune-detail-error-title">Error</h2>
          <p className="rune-detail-error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rune-detail-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No rune data
  if (!rune) {
    return (
      <div className="rune-detail-error">
        <TopNav />
        <div className="rune-detail-error-container">
          <h2 className="rune-detail-error-title">Not Found</h2>
          <p className="rune-detail-error-message">Rune not found</p>
          <button onClick={handleBack} className="rune-detail-back-button">
            Back to Runes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rune-detail" data-testid="rune-detail">
      <TopNav />

      <div className="rune-detail-container">
        {/* Header with Back and Edit buttons */}
        <div className="rune-detail-header">
          <button
            onClick={handleBack}
            className="rune-detail-back-button"
            type="button"
          >
            ← Back to Runes
          </button>
          <button
            onClick={handleEdit}
            className="rune-detail-edit-button"
            type="button"
          >
            Edit
          </button>
        </div>

        {/* Rune Title */}
        <h1 className="rune-detail-title">{rune.title}</h1>

        {/* Rune Description */}
        {rune.description && (
          <div className="rune-detail-description">
            <p>{rune.description}</p>
          </div>
        )}

        {/* Rune Metadata */}
        <div className="rune-detail-metadata">
          <div className="rune-detail-meta-item">
            <span className="rune-detail-meta-label">Status</span>
            <span className={`rune-status rune-status-${rune.status}`}>
              {rune.status}
            </span>
          </div>

          <div className="rune-detail-meta-item">
            <span className="rune-detail-meta-label">Priority</span>
            <span className="rune-detail-meta-value">{rune.priority}</span>
          </div>

          <div className="rune-detail-meta-item">
            <span className="rune-detail-meta-label">Realm ID</span>
            <span className="rune-detail-meta-value">{rune.realm_id || "N/A"}</span>
          </div>

          {rune.claimant && (
            <div className="rune-detail-meta-item">
              <span className="rune-detail-meta-label">Claimant</span>
              <span className="rune-detail-meta-value">{rune.claimant}</span>
            </div>
          )}

          {rune.branch && (
            <div className="rune-detail-meta-item">
              <span className="rune-detail-meta-label">Branch</span>
              <span className="rune-detail-meta-value">{rune.branch}</span>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="rune-detail-timestamps">
          <div className="rune-detail-timestamp-item">
            <span className="rune-detail-timestamp-label">Created</span>
            <span className="rune-detail-timestamp-value">
              {formatDate(rune.created_at)}
            </span>
          </div>

          <div className="rune-detail-timestamp-item">
            <span className="rune-detail-timestamp-label">Updated</span>
            <span className="rune-detail-timestamp-value">
              {formatDate(rune.updated_at)}
            </span>
          </div>
        </div>

        {/* Rune Actions */}
        <div className="rune-detail-actions">
          <button
            onClick={handleForge}
            className="rune-detail-action-button rune-detail-forge-button"
            type="button"
            disabled={rune.status !== "draft"}
          >
            Forge
          </button>

          <button
            onClick={handleFulfill}
            className="rune-detail-action-button rune-detail-fulfill-button"
            type="button"
            disabled={rune.status !== "open" && rune.status !== "claimed"}
          >
            Fulfill
          </button>

          <button
            onClick={handleSealClick}
            className="rune-detail-action-button rune-detail-seal-button"
            type="button"
            disabled={rune.status !== "fulfilled"}
          >
            Seal
          </button>
        </div>

        {/* Seal Confirmation Dialog */}
        <Dialog
          open={sealDialogOpen}
          title="Seal rune"
          description="Are you sure you want to seal this rune? This action closes the rune and cannot be undone."
          onConfirm={handleConfirmSeal}
          onCancel={handleCancelSeal}
          themeColor="var(--color-amber)"
        />
      </div>
    </div>
  );
}
