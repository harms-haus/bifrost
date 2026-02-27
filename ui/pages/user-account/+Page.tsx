import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/use-toast";
import { api } from "@/lib/api";
import type { PatEntry } from "@/types";
import { TopNav } from "@/components/TopNav/TopNav";
import "./+Page.css";

/**
 * User account page for viewing and managing personal account information.
 * Uses PURPLE theme (--color-purple).
 */
export function Page() {
  const { session, isAuthenticated, logout } = useAuth();
  const toast = useToast();

  const [pats, setPats] = useState<PatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPat, setNewPat] = useState<string | null>(null);
  const [showPat, setShowPat] = useState<Record<string, boolean>>({});

  // Fetch PATs on mount
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNewPat(null);

    api
      .getPats()
      .then((data) => {
        setPats(data);
      })
      .catch(() => {
        // Error loading PATs - just show empty state
        setPats([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle PAT rotation (delete old, create new)
  const handleRotatePat = async () => {
    if (!session) return;

    try {
      // Create new PAT first
      const response = await api.createPat({
        account_id: session.account_id,
        name: "Default",
      });

      // Show the new PAT
      setNewPat(response.pat);

      // Revoke all existing PATs
      for (const pat of pats) {
        await api.revokePat({
          account_id: session.account_id,
          pat_id: pat.id,
        });
      }

      // Refresh PAT list
      const updatedPats = await api.getPats();
      setPats(updatedPats);

      toast({
        title: "PAT Rotated",
        description: "Your personal access token has been updated.",
        type: "success",
      });
    } catch {
      toast({
        title: "Rotation Failed",
        description: "Failed to rotate your PAT. Please try again.",
        type: "error",
      });
    }
  };

  // Copy PAT to clipboard
  const handleCopyPat = (pat: string) => {
    navigator.clipboard.writeText(pat);
    toast({
      title: "Copied",
      description: "PAT copied to clipboard",
      type: "info",
    });
  };

  // Toggle PAT visibility
  const togglePatVisibility = (patId: string) => {
    setShowPat((prev) => ({ ...prev, [patId]: !prev[patId] }));
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="user-account-page-not-authenticated">
        <TopNav />
        <div className="user-account-page-login-prompt">
          <p>Please log in to view your account.</p>
          <Link to="/login" className="user-account-page-login-link">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-account-page">
      <TopNav />

      <div className="user-account-page-content">
        {/* Account Header */}
        <div className="user-account-header">
          <div className="user-account-header-left">
            <h1 className="user-account-title">My Account</h1>
            <p className="user-account-subtitle">
              Manage your profile and access tokens
            </p>
          </div>
          <div className="user-account-header-actions">
            <Link to="/profile/edit" className="user-account-edit-link">
              Edit Profile
            </Link>
            <button
              className="user-account-logout-btn"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="user-account-section">
          <h2 className="user-account-section-title">Account Information</h2>
          <div className="user-account-info-grid">
            <div className="user-account-info-item">
              <span className="user-account-info-label">Username</span>
              <span className="user-account-info-value">{session.username}</span>
            </div>
            <div className="user-account-info-item">
              <span className="user-account-info-label">Account ID</span>
              <span className="user-account-info-value">{session.account_id}</span>
            </div>
            <div className="user-account-info-item">
              <span className="user-account-info-label">System Admin</span>
              <span className="user-account-info-value">
                {session.is_sysadmin ? "Yes" : "No"}
              </span>
            </div>
            <div className="user-account-info-item">
              <span className="user-account-info-label">Realms</span>
              <span className="user-account-info-value">
                {session.realms.length} realm{session.realms.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Roles and Realms */}
          <div className="user-account-roles-container">
            <h3 className="user-account-roles-title">Your Roles</h3>
            {session.realms.length === 0 ? (
              <p className="user-account-empty-roles">No realms assigned</p>
            ) : (
              <div className="user-account-roles-list">
                {session.realms.map((realmId) => (
                  <div key={realmId} className="user-account-role-item">
                    <span className="user-account-role-name">
                      {session.realm_names[realmId] || realmId}
                    </span>
                    <span className="user-account-role-badge">
                      {session.roles[realmId] || "viewer"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAT Management */}
        <div className="user-account-section">
          <div className="user-account-section-header">
            <h2 className="user-account-section-title">Personal Access Tokens</h2>
            <button
              className="user-account-rotate-btn"
              onClick={handleRotatePat}
              type="button"
            >
              Rotate PAT
            </button>
          </div>

          {/* New PAT Display */}
          {newPat && (
            <div className="user-account-new-pat">
              <p className="user-account-new-pat-label">
                New PAT (copy it now, it won't be shown again):
              </p>
              <div className="user-account-new-pat-display">
                <code className="user-account-new-pat-token">{newPat}</code>
                <button
                  className="user-account-copy-btn"
                  onClick={() => handleCopyPat(newPat)}
                  type="button"
                >
                  Copy
                </button>
                <button
                  className="user-account-dismiss-btn"
                  onClick={() => setNewPat(null)}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* PAT List */}
          {isLoading ? (
            <p>Loading tokens...</p>
          ) : pats.length === 0 ? (
            <p className="user-account-empty-tokens">
              No personal access tokens. Click "Rotate PAT" to create one.
            </p>
          ) : (
            <div className="user-account-pats-list">
              {pats.map((pat) => (
                <div key={pat.id} className="user-account-pat-item">
                  <div className="user-account-pat-info">
                    <span className="user-account-pat-name">
                      {pat.name || "Unnamed"}
                    </span>
                    <span className="user-account-pat-prefix">{pat.prefix}</span>
                  </div>
                  <div className="user-account-pat-actions">
                    <button
                      className="user-account-show-btn"
                      onClick={() => togglePatVisibility(pat.id)}
                      type="button"
                    >
                      {showPat[pat.id] ? "Hide" : "Show"}
                    </button>
                    {showPat[pat.id] && (
                      <button
                        className="user-account-copy-pat-btn"
                        onClick={() => handleCopyPat(pat.prefix)}
                        type="button"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
