"use client";

import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import type { AdminAccountEntry } from "../../types/account";

export { Page };

function Page() {
  const [accounts, setAccounts] = useState<AdminAccountEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isSysadmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();

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
        setAccounts(data);
      } catch (error) {
        showToast("Error", "Failed to load accounts", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [authLoading, isAuthenticated, isSysadmin, showToast]);

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
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-bold tracking-tight uppercase"
          style={{ color: "var(--color-blue)" }}
        >
          Accounts
        </h1>
        <p
          className="text-sm uppercase tracking-widest mt-1"
          style={{ color: "var(--color-border)" }}
        >
          {accounts.length} account{accounts.length !== 1 ? "s" : ""} total
        </p>
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
        <div>
          {accounts.map((account) => (
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
      </div>
    </div>
  );
}
