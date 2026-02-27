import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { api } from "@/lib/api";
import type { RuneListItem, RealmListEntry, AccountListEntry } from "@/types";
import { TopNav } from "@/components/TopNav/TopNav";
import "./+Page.css";

/**
 * Dashboard page showing rune/realm/account statistics with RED theme.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const { selectedRealm } = useRealm();

  const [runes, setRunes] = useState<RuneListItem[]>([]);
  const [realms, setRealms] = useState<RealmListEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);

    Promise.all([
      api.getRunes(),
      api.getRealms(),
      api.getAccounts(),
    ])
      .then(([runesData, realmsData, accountsData]) => {
        setRunes(runesData);
        setRealms(realmsData);
        setAccounts(accountsData);
      })
      .catch(() => {
        // API errors - just show empty state
        setRunes([]);
        setRealms([]);
        setAccounts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated || !session) {
    return (
      <div className="dashboard-container">
        <TopNav />
        <div className="dashboard-login-prompt">
          <p>Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const openRunesCount = runes.filter(r => r.status === "open").length;
  const currentRealmName = realms.find(r => r.realm_id === selectedRealm)?.name || selectedRealm || "Unknown";

  return (
    <div className="dashboard-container">
      <TopNav />

      <div className="dashboard-content">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome, <span className="dashboard-username">{session.username}</span>
          </h1>
          <p className="dashboard-subtitle">
            Here's an overview of your workspace
          </p>
          {selectedRealm && (
            <p className="dashboard-realm">
              Current realm: <span className="dashboard-realm-name">{currentRealmName}</span>
            </p>
          )}
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="dashboard-stats-loading">
            <p>Loading statistics...</p>
            <div className="dashboard-skeleton-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dashboard-skeleton-card" data-testid="skeleton">
                  <div className="dashboard-skeleton-line" />
                  <div className="dashboard-skeleton-value" />
                  <div className="dashboard-skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dashboard-stats-grid">
            <StatsCard
              title="Total Runes"
              value={runes.length}
              description="All runes in workspace"
              themeColor="var(--color-red)"
            />
            <StatsCard
              title="Total Realms"
              value={realms.length}
              description="All available realms"
              themeColor="var(--color-amber)"
            />
            <StatsCard
              title="Total Accounts"
              value={accounts.length}
              description="All user accounts"
              themeColor="var(--color-green)"
            />
            <StatsCard
              title="Open Runes"
              value={openRunesCount}
              description="Runes awaiting action"
              themeColor="var(--color-blue)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stats card component for displaying a single metric.
 */
function StatsCard({
  title,
  value,
  description,
  themeColor,
}: {
  title: string;
  value: number;
  description: string;
  themeColor: string;
}) {
  return (
    <div className="dashboard-stats-card" style={{ "--card-theme-color": themeColor } as React.CSSProperties}>
      <p className="dashboard-stats-title">{title}</p>
      <p className="dashboard-stats-value">{value}</p>
      <p className="dashboard-stats-description">{description}</p>
    </div>
  );
}
