import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient } from "@/lib/api";
import type { MyStatsResponse } from "@/types";

const api = new ApiClient();

/**
 * Dashboard page showing user stats and quick actions.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<MyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);

    api
      .getMyStats()
      .then(setStats)
      .catch(() => {
        // Stats endpoint may not be available yet, just show empty state
        setStats(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please log in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome, <span className="text-blue-400">{session.username}</span>
        </h1>
        <p className="text-slate-400 mt-1">
          Here's an overview of your runes
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading stats...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Runes"
            value={stats.total_runes}
            description="All runes in current realm"
          />
          <StatsCard
            title="Assigned to You"
            value={stats.open_assigned}
            description="Open runes awaiting your action"
          />
          <StatsCard
            title="Fulfilled This Week"
            value={stats.fulfilled_this_week}
            description="Runes completed this week"
          />
          <StatsCard
            title="Blocked"
            value={stats.blocked_count}
            description="Runes waiting on dependencies"
            highlight={stats.blocked_count > 0}
          />
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/ui/runes/new"
            className="inline-flex items-center px-4 py-2 bg-[var(--page-color)] hover:opacity-90 text-white text-sm font-medium transition-colors"
          >
            Create Rune
          </a>
          <a
            href="/ui/runes?assignee=me"
            className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            My Runes
          </a>
        </div>
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
  highlight = false,
}: {
  title: string;
  value: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-slate-800 p-4 ${
        highlight ? "ring-2 ring-yellow-500" : ""
      }`}
    >
      <p className="text-slate-400 text-sm">{title}</p>
      <p
        className={`text-3xl font-bold ${highlight ? "text-yellow-400" : "text-white"}`}
      >
        {value}
      </p>
      <p className="text-slate-500 text-xs mt-1">{description}</p>
    </div>
  );
}
