import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { navigate } from "vike/client/router";
import { useAuth, useRealm } from "@/lib/auth";
import { RealmSelector } from "@/components/controls/RealmSelector";

// Color map for each page - order matters for the rainbow animation
const NAV_COLORS = [
  { key: 'dashboard', color: '#c53030', label: 'Dashboard' },    // Red (slightly muted)
  { key: 'runes', color: '#f59e0b', label: 'Runes' },            // Amber (saturated)
  { key: 'realm', color: '#4ade80', label: 'Realm' },            // Green (saturated)
  { key: 'accounts', color: '#60a5fa', label: 'Accounts' },      // Blue (saturated)
  { key: 'realms', color: '#8b5cf6', label: 'Realms' },          // Purple
];

// Map URL paths to nav keys
const getNavKey = (pathname: string): string => {
  if (pathname === '/ui' || pathname === '/ui/') return 'dashboard';
  if (pathname.startsWith('/ui/runes')) return 'runes';
  if (pathname.startsWith('/ui/realm')) return 'realm';
  if (pathname.startsWith('/ui/admin/accounts')) return 'accounts';
  if (pathname.startsWith('/ui/admin/realms')) return 'realms';
  return 'dashboard';
};

export function Navbar() {
  const { session, isAuthenticated, logout } = useAuth();
  const { selectedRealm, role } = useRealm();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('dashboard');
  const navItemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: string; width: string }>({ left: '0px', width: '0px' });

  const isRealmAdmin = role === "admin" || role === "owner";
  const isSysAdmin = session?.is_sysadmin ?? false;

  // Memoize nav items to prevent recreation
  const navItems = useMemo(() => {
    const items = [{ key: 'dashboard', href: '/ui', label: 'Dashboard' }];
    if (isAuthenticated) {
      items.push({ key: 'runes', href: '/ui/runes', label: 'Runes' });
      if (isRealmAdmin && selectedRealm) {
        items.push({ key: 'realm', href: '/ui/realm', label: 'Realm' });
      }
      if (isSysAdmin) {
        items.push({ key: 'accounts', href: '/ui/admin/accounts', label: 'Accounts' });
        items.push({ key: 'realms', href: '/ui/admin/realms', label: 'Realms' });
      }
    }
    return items;
  }, [isAuthenticated, isRealmAdmin, isSysAdmin, selectedRealm]);

  const activeColor = NAV_COLORS.find(c => c.key === activeKey)?.color || NAV_COLORS[0].color;

  // Update indicator position based on actual DOM measurements
  const updateIndicatorPosition = useCallback(() => {
    const activeItem = navItemRefs.current.get(activeKey);
    const container = containerRef.current;
    
    if (activeItem && container) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      // Calculate position relative to the container, with 15px padding on each side
      const left = itemRect.left - containerRect.left + 15;
      const width = itemRect.width - 30;
      
      setIndicatorStyle({
        left: `${left}px`,
        width: `${Math.max(width, 20)}px`,
      });
    }
  }, [activeKey]);

  // Update indicator when activeKey changes
  useEffect(() => {
    const timeout = setTimeout(updateIndicatorPosition, 0);
    return () => clearTimeout(timeout);
  }, [activeKey, updateIndicatorPosition, navItems]);

  // Update indicator on window resize
  useEffect(() => {
    const handleResize = () => updateIndicatorPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicatorPosition]);

  // Update active key based on current path
  useEffect(() => {
    const path = window.location.pathname;
    const key = getNavKey(path);
    setActiveKey(key);
  }, []);

  // Listen for navigation
  useEffect(() => {
    const handleNav = () => {
      const path = window.location.pathname;
      const key = getNavKey(path);
      setActiveKey(key);
    };

    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  const handleNavClick = (href: string, key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setActiveKey(key);
    navigate(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }} role="navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/ui" onClick={handleNavClick('/ui', 'dashboard')} className="text-white font-bold text-xl">
              Bifrost
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center" ref={containerRef} style={{ position: 'relative' }}>
            {/* Animated indicator bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                height: '3px',
                backgroundColor: activeColor,
                transition: 'all 0.3s ease',
                borderRadius: '2px',
              }}
            />
            {navItems.map((item) => (
              <a
                key={item.key}
                ref={(el) => {
                  if (el) navItemRefs.current.set(item.key, el);
                }}
                href={item.href}
                onClick={handleNavClick(item.href, item.key)}
                className="px-4 py-2 text-sm font-medium relative z-10"
                style={{
                  color: item.key === activeKey ? activeColor : '#94a3b8',
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && session ? (
              <div className="flex items-center space-x-4">
                <RealmSelector />
                <span className="text-slate-300 text-sm">{session.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/ui/login"
                onClick={handleNavClick('/ui/login', 'dashboard')}
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium"
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={handleNavClick(item.href, item.key)}
                  className="text-slate-300 hover:text-white block px-3 py-2 text-sm font-medium"
                  style={{ color: item.key === activeKey ? activeColor : undefined }}
                >
                  {item.label}
                </a>
              ))}

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
                    onClick={handleNavClick('/ui/login', 'dashboard')}
                    className="text-slate-300 hover:text-white block px-3 py-2 text-sm font-medium"
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