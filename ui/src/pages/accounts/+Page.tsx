"use client";

import { useEffect, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { navigate } from "@/lib/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import type { AdminAccountEntry } from "../../types/account";

export { Page };

function Page() {
  const [accounts, setAccounts] = useState<AdminAccountEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const {
    isAuthenticated,
    isSysadmin,
    accountId,
    username,
    realms,
    roles,
    loading: authLoading,
  } = useAuth();
  const { showToast } = useToast();

  const toFallbackAccounts = (): AdminAccountEntry[] => {
    if (!accountId || !username) {
      return [];
    }

    return [
      {
        account_id: accountId,
        username,
        status: "active",
        realms: realms.filter((realmId) => realmId !== "_admin"),
        roles,
        pat_count: 0,
        created_at: new Date(0).toISOString(),
      },
    ];
  };

  const normalizeAccounts = (rawData: unknown): AdminAccountEntry[] => {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const rawEntry = entry as Partial<AdminAccountEntry>;
        if (!rawEntry.account_id || !rawEntry.username) {
          return null;
        }

        return {
          account_id: rawEntry.account_id,
          username: rawEntry.username,
          status: rawEntry.status ?? "active",
          realms: rawEntry.realms ?? [],
          roles: rawEntry.roles ?? {},
          pat_count: rawEntry.pat_count ?? 0,
          created_at: rawEntry.created_at ?? new Date(0).toISOString(),
        };
      })
      .filter((entry): entry is AdminAccountEntry => entry !== null);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isSysadmin) {
      navigate("/dashboard");
      return;
    }

    const fetchAccounts = async () => {
      try {
        const data = await api.getAdminAccounts();
        const normalized = normalizeAccounts(data);
        setAccounts(normalized.length > 0 ? normalized : toFallbackAccounts());
      } catch (error) {
        const fallbackAccounts = toFallbackAccounts();
        setAccounts(fallbackAccounts);
        if (fallbackAccounts.length === 0) {
          showToast("Error", "Failed to load accounts", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [
    authLoading,
    isAuthenticated,
    isSysadmin,
    accountId,
    username,
    realms,
    roles,
    showToast,
  ]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "var(--color-green)",
      inactive: "var(--color-border)",
      suspended: "var(--color-red)",
    };
    return colors[status] || "var(--color-border)";
  };

  const filteredAccounts =
    statusFilter === "all"
      ? accounts
      : accounts.filter((account) =>
          statusFilter === "active" ? account.status === "active" : account.status !== "active"
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

  if (accounts.length === 0) {
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
            No Accounts Found
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-border)" }}>
            No accounts have been created yet. Use the CLI to create an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      <div className="flex justify-between items-center mb-6">
        <ToggleGroup
          value={[statusFilter]}
          onValueChange={(values) => {
            const nextFilter = values[0];
            if (nextFilter === "all" || nextFilter === "active" || nextFilter === "inactive") {
              setStatusFilter(nextFilter);
            }
          }}
          className="flex flex-wrap gap-2"
        >
          {[
            { label: "All", value: "all" as const },
            { label: "Active", value: "active" as const },
            { label: "Inactive", value: "inactive" as const },
          ].map((filter) => (
            <Toggle
              key={filter.value}
              value={filter.value}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150"
              style={{
                backgroundColor:
                  statusFilter === filter.value ? "var(--color-blue)" : "var(--color-bg)",
                border: "2px solid var(--color-border)",
                color: statusFilter === filter.value ? "white" : "var(--color-text)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {filter.label}
            </Toggle>
          ))}
        </ToggleGroup>

        <Button
          onClick={() => navigate("/accounts/new")}
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            color: "var(--color-text)",
            boxShadow: "var(--shadow-soft)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-blue)";
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
        </Button>
      </div>

      {/* Accounts Table */}
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
          <div className="col-span-3">Username</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Realms</div>
          <div className="col-span-2">Created</div>
        </div>

        {/* Table Body */}
        {filteredAccounts.length === 0 ? (
          <div
            className="px-4 py-12 text-center text-sm uppercase tracking-wider"
            style={{ color: "var(--color-border)" }}
          >
            No accounts match this filter.
          </div>
        ) : (
          <div>
            {filteredAccounts.map((account) => (
            <div
              key={account.account_id}
              className="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-all duration-150 hover:translate-x-[2px]"
              style={{
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
              onClick={() => navigate(`/accounts/${account.account_id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.borderLeftWidth = "4px";
                e.currentTarget.style.borderLeftColor = "var(--color-blue)";
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
                  {account.account_id.slice(0, 8)}
                </span>
              </div>
              <div className="col-span-3">
                <span className="font-medium truncate block">
                  {account.username}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs uppercase tracking-wider px-2 py-1 font-semibold"
                  style={{
                    color: getStatusColor(account.status),
                    border: `1px solid ${getStatusColor(account.status)}`,
                  }}
                >
                  {account.status}
                </span>
              </div>
              <div className="col-span-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-border)" }}
                >
                  {account.realms.length > 0
                    ? account.realms.slice(0, 3).join(", ") +
                      (account.realms.length > 3
                        ? ` +${account.realms.length - 3}`
                        : "")
                    : "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-border)" }}
                >
                  {formatDate(account.created_at)}
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
