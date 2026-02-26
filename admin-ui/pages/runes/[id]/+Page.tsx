import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import { Badge } from "@/components/common";
import type { RuneDetail } from "@/types";

const api = new ApiClient();

/**
 * Rune detail page for viewing and managing a single rune.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [rune, setRune] = useState<RuneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get rune ID from URL
  const runeId = window.location.pathname.split("/").pop();

  // Fetch rune details
  useEffect(() => {
    if (!isAuthenticated || !session || !runeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRune(runeId)
      .then(setRune)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load rune"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session, runeId]);

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view rune details.
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading rune details...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[var(--page-color)] hover:opacity-90 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // Rune not found
  if (!rune) {
    return (
      <div className="text-slate-400 text-center py-8">
        Rune not found.
      </div>
    );
  }

  const statusVariants: Record<string, "default" | "success" | "warning" | "error" | "info" | "purple"> = {
    draft: "default",
    open: "info",
    claimed: "warning",
    fulfilled: "success",
    sealed: "default",
    shattered: "error",
  };

  const priorityLabels: Record<number, string> = {
    0: "None",
    1: "Urgent",
    2: "High",
    3: "Normal",
    4: "Low",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{rune.title}</h1>
            <Badge variant={statusVariants[rune.status] || "default"}>
              {rune.status}
            </Badge>
          </div>
          <p className="text-slate-400 text-sm font-mono mt-1">
            {rune.id}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Priority</p>
          <p className="text-lg font-medium text-white">
            {priorityLabels[rune.priority] || rune.priority}
          </p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Assignee</p>
          <p className="text-lg font-medium text-white">
            {rune.claimant || <span className="text-slate-500 italic">Unassigned</span>}
          </p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Branch</p>
          <p className="text-lg font-medium text-white">
            {rune.branch ? (
              <code className="text-sm bg-slate-700 px-2 py-0.5">
                {rune.branch}
              </code>
            ) : (
              <span className="text-slate-500 italic">No branch</span>
            )}
          </p>
        </div>
        <div className="bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Created</p>
          <p className="text-lg font-medium text-white">
            {new Date(rune.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description */}
      {rune.description && (
        <div className="bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{rune.description}</p>
        </div>
      )}

      {/* Dependencies */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dependencies</h2>
        {rune.dependencies.length === 0 ? (
          <p className="text-slate-400">No dependencies</p>
        ) : (
          <div className="space-y-2">
            {rune.dependencies.map((dep, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-slate-700/50"
              >
                <span className="text-white font-mono">{dep.target_id}</span>
                <Badge variant="default">{dep.relationship}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
        {rune.notes.length === 0 ? (
          <p className="text-slate-400">No notes</p>
        ) : (
          <div className="space-y-3">
            {rune.notes.map((note, index) => (
              <div key={index} className="py-2 px-3 bg-slate-700/50">
                <p className="text-slate-300">{note.text}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
