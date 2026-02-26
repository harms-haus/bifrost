import { useState } from "react";
import { useAuth, useRealm } from "@/lib/auth";

/**
 * RealmSelector displays a dropdown for selecting the current realm.
 * Filters out _admin realm for sysadmins.
 */
export function RealmSelector() {
  const { session } = useAuth();
  const { selectedRealm, availableRealms, setRealm } = useRealm();
  const [isOpen, setIsOpen] = useState(false);

  // Filter out _admin realm - never show it
  const displayRealms = availableRealms.filter((r) => r !== "_admin");

  // Don't render if not authenticated or no displayable realms
  if (!session || displayRealms.length === 0) {
    return null;
  }

  // Determine the effective selected realm (prefer non-admin realm)
  const effectiveRealm =
    selectedRealm && selectedRealm !== "_admin"
      ? selectedRealm
      : displayRealms[0];

  // If selected realm is _admin, switch to first available realm
  if (selectedRealm === "_admin" && displayRealms.length > 0) {
    setRealm(displayRealms[0]);
  }

  // Get display name for a realm from session
  const getDisplayName = (realmId: string): string => {
    return session.realm_names?.[realmId] || realmId;
  };

  const handleSelect = (realmId: string) => {
    setRealm(realmId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center gap-1"
        aria-label="Select realm"
        aria-expanded={isOpen}
      >
        {getDisplayName(effectiveRealm)}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
          {displayRealms.map((realm) => (
            <button
              key={realm}
              type="button"
              onClick={() => handleSelect(realm)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                realm === effectiveRealm
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {getDisplayName(realm)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
