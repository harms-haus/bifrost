import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useRealm } from "@/lib/auth";

/**
 * Navbar component with navigation links and user menu.
 * Shows different nav items based on user permissions.
 */
export function Navbar() {
  const { session, isAuthenticated, logout } = useAuth();
  const { selectedRealm, role } = useRealm();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRealmAdmin = role === "admin" || role === "owner";
  const isSysAdmin = session?.is_sysadmin ?? false;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700" role="navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Bifrost
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">Dashboard</NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/runes">Runes</NavLink>

                {isRealmAdmin && selectedRealm && (
                  <NavLink to={`/realm/${selectedRealm}`}>Realm</NavLink>
                )}

                {isSysAdmin && (
                  <>
                    <NavLink to="/accounts">Accounts</NavLink>
                    <NavLink to="/realms">Realms</NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && session ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 text-sm">{session.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </MobileNavLink>

              {isAuthenticated && (
                <>
                  <MobileNavLink to="/runes" onClick={() => setIsMobileMenuOpen(false)}>
                    Runes
                  </MobileNavLink>

                  {isRealmAdmin && selectedRealm && (
                    <MobileNavLink
                      to={`/realm/${selectedRealm}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Realm
                    </MobileNavLink>
                  )}

                  {isSysAdmin && (
                    <>
                      <MobileNavLink
                        to="/accounts"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Accounts
                      </MobileNavLink>
                      <MobileNavLink
                        to="/realms"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Realms
                      </MobileNavLink>
                    </>
                  )}
                </>
              )}

              <div className="border-t border-slate-700 pt-2 mt-2">
                {isAuthenticated && session ? (
                  <>
                    <div className="text-slate-300 text-sm px-3 py-2">
                      {session.username}
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-slate-300 hover:text-white block px-3 py-2 text-sm w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <MobileNavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </MobileNavLink>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Desktop navigation link
 */
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
    </Link>
  );
}

/**
 * Mobile navigation link
 */
function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
    </Link>
  );
}
