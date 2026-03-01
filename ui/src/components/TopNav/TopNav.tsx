"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import "./TopNav.css";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", color: "#ef4444" },
  { href: "/runes", label: "Runes", color: "#f59e0b" },
  { href: "/realms", label: "Realms", color: "#22c55e" },
  { href: "/accounts", label: "Accounts", color: "#3b82f6" },
];

export function TopNav() {
  const { username } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const updateIndicator = () => {
      const navElement = navRef.current;
      const activeLink = linkRefs.current[activeIndex];

      if (!navElement || !activeLink) {
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const left = linkRect.left - navRect.left;

      setIndicatorStyle({
        transform: `translateX(${left}px)`,
        width: `${linkRect.width}px`,
        backgroundSize: `${navRect.width}px 100%`,
        backgroundPosition: `-${left}px 0`,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex]);

  // Determine active link based on current path
  useEffect(() => {
    const path = window.location.pathname;
    const index = NAV_LINKS.findIndex(
      (link) => link.href === path || (link.href !== "/" && path.startsWith(link.href))
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, []);

  const handleNavClick = (href: string, index: number) => {
    setActiveIndex(index);
    navigate(href);
  };

  return (
    <nav className="top-nav">
      {/* Logo */}
      <a href="/" className="top-nav__logo" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
        <span className="top-nav__logo-text">Bifrost</span>
      </a>

      {/* Navigation Links with Rainbow Indicator */}
      <div className="top-nav__links-container" ref={navRef}>
        <div
          className="top-nav__indicator"
          style={indicatorStyle}
        />
        
        {/* Nav links */}
        {NAV_LINKS.map((link, index) => (
          <button
            key={link.href}
            className={`top-nav__link ${activeIndex === index ? "top-nav__link--active" : ""}`}
            onClick={() => handleNavClick(link.href, index)}
            style={{ "--link-color": link.color } as React.CSSProperties}
            ref={(element) => {
              linkRefs.current[index] = element;
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side: Theme toggle + Account badge */}
      <div className="top-nav__right">
        <button
          className="top-nav__theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="top-nav__account">
          <span className="top-nav__account-badge">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </span>
          <span className="top-nav__account-name">{username || "Guest"}</span>
        </div>
      </div>
    </nav>
  );
}
