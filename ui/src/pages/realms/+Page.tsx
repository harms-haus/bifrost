"use client";

import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import type { RealmListEntry, RealmStatus } from "../../types/realm";

export { Page };

function Page() {
  const [realms, setRealms] = useState<RealmListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchRealms = async () => {
      try {
        const data = await api.getRealms();
        setRealms(data);
      } catch (error) {
        showToast("Error", "Failed to load realms", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealms();
  }, [authLoading, isAuthenticated, showToast]);

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
          style={{ color: "var(--color-green)" }}
        >
          Realms
        </h1>
        <p
          className="text-sm uppercase tracking-widest mt-1"
          style={{ color: "var(--color-border)" }}
        >
          {realms.length} realm{realms.length !== 1 ? "s" : ""} available
        </p>
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
        <div>
          {realms.map((realm) => (
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
      </div>
    </div>
  );
}
