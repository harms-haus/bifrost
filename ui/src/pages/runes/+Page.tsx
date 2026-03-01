"use client";

import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import type { RuneListItem, RuneStatus } from "../../types/rune";

export { Page };

const STATUS_FILTERS: { label: string; value: RuneStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Sealed", value: "sealed" },
];

function Page() {
  const [runes, setRunes] = useState<RuneListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RuneStatus | "all">("all");
  const { realms, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchRunes = async () => {
      if (realms.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getRunes(realms[0]);
        setRunes(data);
      } catch (error) {
        showToast("Error", "Failed to load runes", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRunes();
  }, [authLoading, isAuthenticated, realms, showToast]);

  const filteredRunes =
    statusFilter === "all"
      ? runes
      : runes.filter((r) => r.status === statusFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: RuneStatus) => {
    const colors: Record<RuneStatus, string> = {
      draft: "var(--color-border)",
      open: "var(--color-blue)",
      in_progress: "var(--color-amber)",
      fulfilled: "var(--color-green)",
      sealed: "var(--color-purple)",
    };
    return colors[status];
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) {
      return { label: "P1", color: "var(--color-red)" };
    } else if (priority >= 3) {
      return { label: "P2", color: "var(--color-amber)" };
    } else if (priority >= 2) {
      return { label: "P3", color: "var(--color-blue)" };
    }
    return { label: "P4", color: "var(--color-border)" };
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div
          className="px-8 py-4 text-lg font-bold uppercase tracking-wider"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (realms.length === 0) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
        <div
          className="p-8 text-center max-w-md"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">
            No Realms Found
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-border)" }}>
            You don't have access to any realms yet. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-bold tracking-tight uppercase"
          style={{ color: "var(--color-amber)" }}
        >
          Runes
        </h1>
        <p
          className="text-sm uppercase tracking-widest mt-1"
          style={{ color: "var(--color-border)" }}
        >
          {filteredRunes.length} rune{filteredRunes.length !== 1 ? "s" : ""} in realm
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150"
            style={{
              backgroundColor:
                statusFilter === filter.value
                  ? "var(--color-amber)"
                  : "var(--color-bg)",
              border: "2px solid var(--color-border)",
              color:
                statusFilter === filter.value ? "white" : "var(--color-text)",
              boxShadow:
                statusFilter === filter.value
                  ? "3px 3px 0px var(--color-border)"
                  : "2px 2px 0px var(--color-border)",
            }}
            onMouseEnter={(e) => {
              if (statusFilter !== filter.value) {
                e.currentTarget.style.backgroundColor = "var(--color-amber)";
                e.currentTarget.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== filter.value) {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                e.currentTarget.style.color = "var(--color-text)";
              }
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Runes Table */}
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{
            borderBottom: "2px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div className="col-span-1">ID</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Created</div>
        </div>

        {/* Table Body */}
        {filteredRunes.length === 0 ? (
          <div
            className="px-4 py-12 text-center text-sm uppercase tracking-wider"
            style={{ color: "var(--color-border)" }}
          >
            No runes found. Create your first rune to get started.
          </div>
        ) : (
          <div>
            {filteredRunes.map((rune) => {
              const priorityBadge = getPriorityBadge(rune.priority);
              return (
                <div
                  key={rune.id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-all duration-150 hover:translate-x-[2px]"
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                  onClick={() => navigate(`/runes/${rune.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                    e.currentTarget.style.borderLeftWidth = "4px";
                    e.currentTarget.style.borderLeftColor = "var(--color-amber)";
                    e.currentTarget.style.borderLeftStyle = "solid";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-bg)";
                    e.currentTarget.style.borderLeftWidth = "0px";
                  }}
                >
                  <div className="col-span-1">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--color-border)" }}
                    >
                      {rune.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <span className="font-medium truncate block">
                      {rune.title}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="text-xs uppercase tracking-wider px-2 py-1 font-semibold"
                      style={{
                        color: getStatusColor(rune.status),
                        border: `1px solid ${getStatusColor(rune.status)}`,
                      }}
                    >
                      {rune.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="text-xs font-bold px-2 py-1"
                      style={{
                        backgroundColor: priorityBadge.color,
                        color: "white",
                      }}
                    >
                      {priorityBadge.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-border)" }}
                    >
                      {formatDate(rune.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
