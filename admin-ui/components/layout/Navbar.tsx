import { useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth, useRealm } from "@/lib/auth";
import { RealmSelector } from "@/components/controls/RealmSelector";

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

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700" role="navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/ui" onClick={handleNavClick("/ui")} className="text-white font-bold text-xl">
              Bifrost
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/ui">Dashboard</NavLink>

            {isAuthenticated && (
              <>
                <NavLink href="/ui/runes">Runes</NavLink>

                {isRealmAdmin && selectedRealm && (
                  <NavLink href="/ui/realm">Realm</NavLink>
                )}

                {isSysAdmin && (
                  <>
                    <NavLink href="/ui/admin/accounts">Accounts</NavLink>
                    <NavLink href="/ui/admin/realms">Realms</NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && session ? (
              <div className="flex items-center space-x-4">
                <RealmSelector />
                <span className="text-slate-300 text-sm">{session.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/ui/login"
                onClick={handleNavClick("/ui/login")}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </a>
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
              <a
                href="/ui"
                onClick={handleNavClick("/ui")}
                className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>

              {isAuthenticated && (
                <>
                  <a
                    href="/ui/runes"
                    onClick={handleNavClick("/ui/runes")}
                    className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Runes
                  </a>

                  {isRealmAdmin && selectedRealm && (
                    <a
                      href="/ui/realm"
                      onClick={handleNavClick("/ui/realm")}
                      className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Realm
                    </a>
                  )}

                  {isSysAdmin && (
                    <>
                      <a
                        href="/ui/admin/accounts"
                        onClick={handleNavClick("/ui/admin/accounts")}
                        className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Accounts
                      </a>
                      <a
                        href="/ui/admin/realms"
                        onClick={handleNavClick("/ui/admin/realms")}
                        className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Realms
                      </a>
                    </>
                  )}
                </>
              )}

              <div className="border-t border-slate-700 pt-2 mt-2">
                {isAuthenticated && session ? (
                  <>
                    <div className="px-3 py-2">
                      <RealmSelector />
                    </div>
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
                  <a
                    href="/ui/login"
                    onClick={handleNavClick("/ui/login")}
                    className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </a>
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
 * Desktop navigation link using Vike's navigate for SPA routing
 */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
    </a>
  );
}
