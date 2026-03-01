"use client";

import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { useAuth } from "../../../lib/auth";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";
import { Dialog } from "../../../components/Dialog/Dialog";
import type { RuneDetail, RuneStatus } from "../../../types/rune";

export { Page };

const statusColors: Record<RuneStatus, { bg: string; border: string; text: string }> = {
  draft: {
    bg: "var(--color-bg)",
    border: "var(--color-border)",
    text: "var(--color-border)",
  },
  open: {
    bg: "var(--color-blue)",
    border: "var(--color-border)",
    text: "white",
  },
  in_progress: {
    bg: "var(--color-amber)",
    border: "var(--color-border)",
    text: "white",
  },
  fulfilled: {
    bg: "var(--color-green)",
    border: "var(--color-border)",
    text: "white",
  },
  sealed: {
    bg: "var(--color-purple)",
    border: "var(--color-border)",
    text: "white",
  },
};

function Page() {
  const pageContext = usePageContext();
  const runeId = pageContext.routeParams?.id as string;
  const { realms, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [rune, setRune] = useState<RuneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!runeId || realms.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchRune = async () => {
      try {
        const data = await api.getRune(realms[0], runeId);
        setRune(data);
      } catch (error) {
        showToast("Error", "Failed to load rune", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRune();
  }, [authLoading, isAuthenticated, realms, runeId, showToast]);

  const handleDelete = async () => {
    if (!rune || realms.length === 0) return;

    setIsDeleting(true);
    try {
      await api.deleteRune(realms[0], rune.id);
      showToast("Rune Deleted", `"${rune.title}" has been deleted`, "success");
      navigate("/runes");
    } catch (error) {
      showToast("Error", "Failed to delete rune", "error");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: RuneStatus) => statusColors[status];

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

  if (!rune) {
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
            Rune Not Found
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-border)" }}>
            The rune you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate("/runes")}
            className="px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-150"
            style={{
              backgroundColor: "var(--color-amber)",
              border: "2px solid var(--color-border)",
              color: "white",
            boxShadow: "var(--shadow-soft)",
            }}
            onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
              e.currentTarget.style.transform = "translate(2px, 2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-soft)";
              e.currentTarget.style.transform = "translate(0, 0)";
            }}
          >
            Back to Runes
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(rune.status);

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/runes")}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 transition-all duration-150 hover:translate-x-[-2px]"
          style={{ color: "var(--color-border)" }}
        >
          <span>&larr;</span>
          <span>Back to Runes</span>
        </button>
        <h1
          className="text-4xl font-bold tracking-tight uppercase"
          style={{ color: "var(--color-amber)" }}
        >
          {rune.title}
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <span
            className="text-xs uppercase tracking-wider px-3 py-1 font-bold"
            style={{
              backgroundColor: statusStyle.bg,
              border: `2px solid ${statusStyle.border}`,
              color: statusStyle.text,
            }}
          >
            {rune.status.replace("_", " ")}
          </span>
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--color-border)" }}
          >
            ID: {rune.id}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description Card */}
        <div
          className="lg:col-span-2 p-6"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2
            className="text-sm uppercase tracking-wider font-bold mb-4"
            style={{ color: "var(--color-border)" }}
          >
            Description
          </h2>
          {rune.description ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {rune.description}
            </p>
          ) : (
            <p
              className="text-base italic"
              style={{ color: "var(--color-border)" }}
            >
              No description provided
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div
            className="p-6"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
            }}
          >
            <h2
              className="text-sm uppercase tracking-wider font-bold mb-4"
              style={{ color: "var(--color-border)" }}
            >
              Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs uppercase tracking-wider block mb-1"
                  style={{ color: "var(--color-border)" }}
                >
                  Status
                </label>
                <span
                  className="text-xs uppercase tracking-wider px-2 py-1 font-bold"
                  style={{
                    backgroundColor: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    color: statusStyle.text,
                  }}
                >
                  {rune.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <label
                  className="text-xs uppercase tracking-wider block mb-1"
                  style={{ color: "var(--color-border)" }}
                >
                  Priority
                </label>
                <span className="text-sm font-bold">{rune.priority}</span>
              </div>

              <div>
                <label
                  className="text-xs uppercase tracking-wider block mb-1"
                  style={{ color: "var(--color-border)" }}
                >
                  Created
                </label>
                <span className="text-sm">{formatDate(rune.created_at)}</span>
              </div>

              <div>
                <label
                  className="text-xs uppercase tracking-wider block mb-1"
                  style={{ color: "var(--color-border)" }}
                >
                  Updated
                </label>
                <span className="text-sm">{formatDate(rune.updated_at)}</span>
              </div>

              {rune.saga_id && (
                <div>
                  <label
                    className="text-xs uppercase tracking-wider block mb-1"
                    style={{ color: "var(--color-border)" }}
                  >
                    Saga
                  </label>
                  <span className="text-sm font-mono">{rune.saga_id}</span>
                </div>
              )}

              {rune.assignee_id && (
                <div>
                  <label
                    className="text-xs uppercase tracking-wider block mb-1"
                    style={{ color: "var(--color-border)" }}
                  >
                    Assignee
                  </label>
                  <span className="text-sm font-mono">{rune.assignee_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Card */}
          {rune.tags.length > 0 && (
            <div
              className="p-6"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
              }}
            >
              <h2
                className="text-sm uppercase tracking-wider font-bold mb-4"
                style={{ color: "var(--color-border)" }}
              >
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {rune.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--color-amber)",
                      border: "1px solid var(--color-border)",
                      color: "white",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies Card */}
          {rune.dependencies.length > 0 && (
            <div
              className="p-6"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
              }}
            >
              <h2
                className="text-sm uppercase tracking-wider font-bold mb-4"
                style={{ color: "var(--color-border)" }}
              >
                Dependencies
              </h2>
              <div className="space-y-2">
                {rune.dependencies.map((dep) => (
                  <div
                    key={dep}
                    className="text-xs font-mono p-2"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {dep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Card */}
          <div
            className="p-6"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
            }}
          >
            <h2
              className="text-sm uppercase tracking-wider font-bold mb-4"
              style={{ color: "var(--color-border)" }}
            >
              Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/runes/${rune.id}/edit`)}
                className="w-full px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-amber)",
                  border: "2px solid var(--color-border)",
                  color: "white",
            boxShadow: "var(--shadow-soft)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                  e.currentTarget.style.transform = "translate(2px, 2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                  e.currentTarget.style.transform = "translate(0, 0)";
                }}
              >
                Edit Rune
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-red)",
                  border: "2px solid var(--color-border)",
                  color: "white",
            boxShadow: "var(--shadow-soft)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                  e.currentTarget.style.transform = "translate(2px, 2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                  e.currentTarget.style.transform = "translate(0, 0)";
                }}
              >
                Delete Rune
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Rune"
        description={`Are you sure you want to delete "${rune.title}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        color="red"
      />
    </div>
  );
}
