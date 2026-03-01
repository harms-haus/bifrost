"use client";

import { useEffect, useState } from "react";
import { navigate } from "@/lib/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import type { RealmListEntry, RealmStatus } from "../../types/realm";

export { Page };

function Page() {
  const [realms, setRealms] = useState<RealmListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const {
    isAuthenticated,
    realms: sessionRealmIds,
    realmNames,
    loading: authLoading,
  } = useAuth();
  const { showToast } = useToast();

  const toFallbackRealms = (): RealmListEntry[] => {
    const visibleRealmIds = sessionRealmIds.filter((realmId) => realmId !== "_admin");

    return visibleRealmIds.map((realmId) => ({
      id: realmId,
      name: realmNames[realmId] ?? realmId,
      status: "active",
      created_at: new Date(0).toISOString(),
    }));
  };

  const normalizeRealms = (rawData: unknown): RealmListEntry[] => {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const rawEntry = entry as {
          id?: string;
          realm_id?: string;
          name?: string;
          status?: string;
          created_at?: string;
        };

        const id = rawEntry.id ?? rawEntry.realm_id;
        if (!id) {
          return null;
        }

        const status: RealmStatus = rawEntry.status === "suspended" ? "archived" : "active";

        return {
          id,
          name: rawEntry.name ?? realmNames[id] ?? id,
          status,
          created_at: rawEntry.created_at ?? new Date(0).toISOString(),
        };
      })
      .filter((entry): entry is RealmListEntry => entry !== null);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchRealms = async () => {
      try {
        const data = await api.getRealms();
        const normalized = normalizeRealms(data);
        setRealms(normalized.length > 0 ? normalized : toFallbackRealms());
      } catch (error) {
        const fallbackRealms = toFallbackRealms();
        setRealms(fallbackRealms);
        if (fallbackRealms.length === 0) {
          showToast("Error", "Failed to load realms", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealms();
  }, [authLoading, isAuthenticated, sessionRealmIds, realmNames, showToast]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: RealmStatus) => {
    const colors: Record<RealmStatus, string> = {
      active: "var(--color-green)",
      archived: "var(--color-border)",
    };
    return colors[status];
  };

  const filteredRealms =
    statusFilter === "all"
      ? realms
      : realms.filter((realm) =>
          statusFilter === "active" ? realm.status === "active" : realm.status !== "active"
        );

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
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Active", value: "active" as const },
            { label: "Inactive", value: "inactive" as const },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150"
              style={{
                backgroundColor:
                  statusFilter === filter.value ? "var(--color-green)" : "var(--color-bg)",
                border: "2px solid var(--color-border)",
                color: statusFilter === filter.value ? "white" : "var(--color-text)",
                boxShadow: "var(--shadow-soft)",
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== filter.value) {
                  e.currentTarget.style.backgroundColor = "var(--color-green)";
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

        <button
          onClick={() => navigate("/realms/new")}
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            color: "var(--color-text)",
            boxShadow: "var(--shadow-soft)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-green)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-bg)";
            e.currentTarget.style.color = "var(--color-text)";
            e.currentTarget.style.boxShadow = "var(--shadow-soft)";
          }}
        >
          +
        </button>
      </div>

      {/* Realms Table */}
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
          <div className="col-span-2">ID</div>
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Created</div>
        </div>

        {/* Table Body */}
        {filteredRealms.length === 0 ? (
          <div
            className="px-4 py-12 text-center text-sm uppercase tracking-wider"
            style={{ color: "var(--color-border)" }}
          >
            No realms match this filter.
          </div>
        ) : (
          <div>
            {filteredRealms.map((realm) => (
            <div
              key={realm.id}
              className="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-all duration-150 hover:translate-x-[2px]"
              style={{
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
              onClick={() => navigate(`/realms/${realm.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.borderLeftWidth = "4px";
                e.currentTarget.style.borderLeftColor = "var(--color-green)";
                e.currentTarget.style.borderLeftStyle = "solid";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                e.currentTarget.style.borderLeftWidth = "0px";
              }}
            >
              <div className="col-span-2">
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--color-border)" }}
                >
                  {realm.id.slice(0, 8)}
                </span>
              </div>
              <div className="col-span-6">
                <span className="font-medium truncate block">
                  {realm.name}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs uppercase tracking-wider px-2 py-1 font-semibold"
                  style={{
                    color: getStatusColor(realm.status),
                    border: `1px solid ${getStatusColor(realm.status)}`,
                  }}
                >
                  {realm.status}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-border)" }}
                >
                  {formatDate(realm.created_at)}
                </span>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
