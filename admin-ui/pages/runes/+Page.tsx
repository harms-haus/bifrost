import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApiClient, ApiError } from "@/lib/api";
import { RuneTable } from "@/components/runes/RuneTable";
import type { RuneListItem } from "@/types";

const api = new ApiClient();

/**
 * Runes list page for viewing and managing runes.
 */
export function Page() {
  const { session, isAuthenticated } = useAuth();
  const [runes, setRunes] = useState<RuneListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch runes
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getRunes()
      .then(setRunes)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load runes"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, session]);

  // Handle viewing rune details
  const handleViewRune = (runeId: string) => {
    window.location.href = `/ui/runes/${runeId}`;
  };

  // Not authenticated
  if (!isAuthenticated || !session) {
    return (
      <div className="text-slate-400 text-center py-8">
        Please <a href="/ui/login" className="text-blue-400 hover:underline">log in</a> to view runes.
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading runes...
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
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Runes</h1>
        <p className="text-slate-400 text-sm mt-1">
          {runes.length} rune{runes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Runes Table */}
      <div className="bg-slate-800 rounded-lg p-6">
        <RuneTable
          runes={runes}
          onViewRune={handleViewRune}
        />
      </div>
    </div>
  );
}
