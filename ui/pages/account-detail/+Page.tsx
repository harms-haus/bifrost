import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import type { AccountDetail } from "@/types";
import "./+Page.css";

/**
 * Account detail page for viewing and managing a single account.
 * Only accessible to system administrators.
 */
export function Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm, role, availableRealms, setRealm } = useRealm();
  const { show } = useToast();

  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRotatingPat, setIsRotatingPat] = useState(false);
  const [newPat, setNewPat] = useState<string | null>(null);
  const [showPat, setShowPat] = useState(false);

  // Get account ID from URL params
  const accountId = searchParams.get("id");

  // Sync realm with API
  useEffect(() => {
    api.setRealm(selectedRealm);
  }, [selectedRealm]);

  // Fetch account details
  useEffect(() => {
    if (!isAuthenticated || !session || !session.is_sysadmin || !accountId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAccount(null);
    setNewPat(null);

    api
      .getAccount(accountId)
      .then((data) => {
        setAccount(data);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load account");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session, accountId]);

  // Handle rotate PAT
  const handleRotatePat = async () => {
    if (!accountId) return;

    setIsRotatingPat(true);
    setNewPat(null);

    try {
      const result = await api.createPat({ account_id: accountId });
      setNewPat(result.pat);
      setShowPat(true);
      show({
        type: "success",
        title: "PAT rotated",
        description: `A new PAT has been generated for ${account?.username}`,
      });
    } catch (err) {
      show({
        type: "error",
        title: "Failed to rotate PAT",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsRotatingPat(false);
    }
  };

  // Handle copy PAT
  const handleCopyPat = () => {
    if (newPat) {
      navigator.clipboard.writeText(newPat);
      show({
        type: "success",
        title: "PAT copied",
        description: "The PAT has been copied to clipboard",
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate("/accounts");
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
      <div className="account-detail-page-not-authenticated">
        <TopNav />
        <div className="account-detail-page-login-prompt">
          <p>Please log in to view account details.</p>
          <a href="/login" className="account-detail-page-login-link">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // Not a sysadmin
  if (!session.is_sysadmin) {
    return (
      <div className="account-detail-page-not-authenticated">
        <TopNav />
        <div className="account-detail-page-error">
          <h2 className="account-detail-page-error-title">Access Denied</h2>
          <p className="account-detail-page-error-message">
            Only system administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="account-detail-page-loading">
        <TopNav />
        <p>Loading account...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="account-detail-page-error">
        <TopNav />
        <div className="account-detail-page-error-content">
          <h2 className="account-detail-page-error-title">Error</h2>
          <p className="account-detail-page-error-message">{error}</p>
          <button
            className="account-detail-page-retry-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Account not found
  if (!account) {
    return (
      <div className="account-detail-page-error">
        <TopNav />
        <div className="account-detail-page-error-content">
          <h2 className="account-detail-page-error-title">Account Not Found</h2>
          <p className="account-detail-page-error-message">
            The requested account could not be found.
          </p>
          <button
            className="account-detail-page-back-button"
            onClick={handleBack}
            type="button"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-detail-page" data-testid="account-detail">
      <TopNav />

      <div className="account-detail-page-content">
        {/* Header */}
        <div className="account-detail-page-header">
          <button
            className="account-detail-page-back-button"
            onClick={handleBack}
            type="button"
          >
            ← Back
          </button>
          <h1 className="account-detail-page-title">Account Details</h1>
        </div>

        {/* Account Information Card */}
        <div className="account-detail-page-card">
          <div className="account-detail-page-card-header">
            <h2 className="account-detail-page-card-title">Account Information</h2>
            <span
              className={`account-detail-page-status-badge account-detail-page-status-badge-${account.status}`}
            >
              {account.status}
            </span>
          </div>

          <div className="account-detail-page-card-body">
            <div className="account-detail-page-field">
              <span className="account-detail-page-field-label">Username:</span>
              <span className="account-detail-page-field-value">{account.username}</span>
            </div>

            <div className="account-detail-page-field">
              <span className="account-detail-page-field-label">Account ID:</span>
              <span className="account-detail-page-field-value">{account.account_id}</span>
            </div>

            {account.email && (
              <div className="account-detail-page-field">
                <span className="account-detail-page-field-label">Email:</span>
                <span className="account-detail-page-field-value">{account.email}</span>
              </div>
            )}

            <div className="account-detail-page-field">
              <span className="account-detail-page-field-label">Status:</span>
              <span className="account-detail-page-field-value">{account.status}</span>
            </div>

            <div className="account-detail-page-field">
              <span className="account-detail-page-field-label">Created:</span>
              <span className="account-detail-page-field-value">{formatDate(account.created_at)}</span>
            </div>

            <div className="account-detail-page-field">
              <span className="account-detail-page-field-label">PATs:</span>
              <span className="account-detail-page-field-value">{account.pat_count}</span>
            </div>
          </div>
        </div>

        {/* Realms and Roles Card */}
        <div className="account-detail-page-card">
          <div className="account-detail-page-card-header">
            <h2 className="account-detail-page-card-title">Realms and Roles</h2>
          </div>

          <div className="account-detail-page-card-body">
            {account.realms.length === 0 ? (
              <p className="account-detail-page-empty">No realms assigned</p>
            ) : (
              <div className="account-detail-page-realms-list">
                {account.realms.map((realmId) => (
                  <div key={realmId} className="account-detail-page-realm-item">
                    <div className="account-detail-page-realm-name">{realmId}</div>
                    <div className="account-detail-page-realm-role">
                      {account.roles[realmId] || "unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAT Management Card */}
        <div className="account-detail-page-card">
          <div className="account-detail-page-card-header">
            <h2 className="account-detail-page-card-title">PAT Management</h2>
          </div>

          <div className="account-detail-page-card-body">
            <p className="account-detail-page-pat-description">
              Generate a new Personal Access Token for this account. This will create a new
              token that can be used for authentication.
            </p>

            <button
              className="account-detail-page-rotate-button"
              onClick={handleRotatePat}
              disabled={isRotatingPat}
              type="button"
            >
              {isRotatingPat ? "Rotating..." : "Rotate PAT"}
            </button>

            {/* Show new PAT after rotation */}
            {newPat && (
              <div className="account-detail-page-new-pat">
                <div className="account-detail-page-pat-header">
                  <span className="account-detail-page-pat-label">New PAT:</span>
                  <div className="account-detail-page-pat-actions">
                    <button
                      className="account-detail-page-pat-toggle"
                      onClick={() => setShowPat(!showPat)}
                      type="button"
                    >
                      {showPat ? "Hide" : "Show"}
                    </button>
                    <button
                      className="account-detail-page-pat-copy"
                      onClick={handleCopyPat}
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="account-detail-page-pat-value">
                  {showPat ? newPat : "••••••••••••••••"}
                </div>
                <p className="account-detail-page-pat-warning">
                  ⚠️ Save this token securely. You won't be able to see it again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
