import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { Popover } from "@base-ui/react/popover";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import "./TopNav.css";

export const TopNav = function TopNavComponent() {
  const { isAuthenticated, session, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Nav links with their colors and paths
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", color: "var(--color-red)" },
    { name: "Runes", path: "/runes", color: "var(--color-amber)" },
    { name: "Realms", path: "/realms", color: "var(--color-green)" },
    { name: "Accounts", path: "/accounts", color: "var(--color-blue)" },
  ];

  // Get active link for indicator position
  const activeLinkIndex = navLinks.findIndex(
    (link) => link.path === location.pathname
  );

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        {/* Bifrost Logo */}
        <Link to="/dashboard" className="top-nav-logo">
          <h1 className="top-nav-logo-text">Bifrost</h1>
        </Link>

        {/* Navigation Links with Rainbow Indicator */}
        <div className="top-nav-links">
          {/* Rainbow Gradient Background */}
          <div className="top-nav-rainbow">
            {/* Sliding Indicator - Shows color of active link */}
            <div
              className="top-nav-indicator"
              style={{
                left: `${activeLinkIndex >= 0 ? activeLinkIndex * 25 : 0}%`,
                backgroundColor: activeLinkIndex >= 0 ? navLinks[activeLinkIndex].color : "transparent",
              }}
              data-testid="rainbow-indicator"
            />
          </div>

          {/* Navigation Links */}
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className="top-nav-link"
              style={
                {
                  "--link-color": link.color,
                } as CSSProperties
              }
              data-active={index === activeLinkIndex}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="top-nav-controls">
          {/* Theme Toggle */}
          <button
            className="top-nav-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            type="button"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Account Badge */}
          {isAuthenticated && session && (
            <Popover.Root>
              <Popover.Trigger className="top-nav-account-badge">
                <span className="top-nav-username">{session.username}</span>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner sideOffset={8}>
                  <Popover.Popup className="top-nav-account-popover">
                    <div className="top-nav-account-info">
                      <p className="top-nav-account-email">{session.username}</p>
                      {session.realms.length > 0 && (
                        <p className="top-nav-account-realms">
                          {session.realms.length} realm{session.realms.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                    <button
                      className="top-nav-logout-btn"
                      onClick={logout}
                      type="button"
                    >
                      Logout
                    </button>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>
      </div>
    </nav>
  );
}
