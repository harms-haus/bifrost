import { useState } from "react";
import { useAuth, useRealm } from "@/lib/auth";

/**
 * RealmSelector displays a dropdown for selecting the current realm.
 * Shows only a label when there's a single realm.
 * Filters out _admin realm for sysadmins.
 */
export function RealmSelector() {
  const { session } = useAuth();
  const { selectedRealm, availableRealms, setRealm } = useRealm();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not authenticated or no realms
  if (!session || availableRealms.length === 0 || !selectedRealm) {
    return null;
  }

  // Filter out _admin realm
  const displayRealms = availableRealms.filter((r) => r !== "_admin");

  // Single realm - just show the name
  if (displayRealms.length === 1) {
    return (
      <span className="text-slate-300 text-sm px-3 py-2">{selectedRealm}</span>
    );
  }

  const handleSelect = (realmId: string) => {
    setRealm(realmId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
        aria-label="Select realm"
        aria-expanded={isOpen}
      >
        {selectedRealm}
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
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="listbox">
            {displayRealms.map((realm) => (
              <button
                key={realm}
                type="button"
                onClick={() => handleSelect(realm)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  realm === selectedRealm
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                role="option"
                aria-selected={realm === selectedRealm}
              >
                {realm}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
