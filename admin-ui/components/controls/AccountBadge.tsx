import { useState } from "react";
import { useAuth } from "@/lib/auth";

/**
 * AccountBadge displays the current user's username with a dropdown menu.
 * Shows "My Account" link and "Logout" button.
 */
export function AccountBadge() {
  const { session, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not authenticated
  if (!isAuthenticated || !session) {
    return null;
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {session.username}
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
          <div className="py-1" role="menu">
            <a
              href="/ui/account"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              role="menuitem"
            >
              My Account
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
