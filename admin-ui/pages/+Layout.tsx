import "./Layout.css";
import "./tailwind.css";
import { AppProviders } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { usePageContext } from "vike-react/usePageContext";

// Page color map - matches nav indicator colors
// Dashboard (red), Runes (orange), Realm (green), Accounts (blue), Realms (purple)
const pageColorMap: Record<string, string> = {
  runes: '#d77a61',      // Orange
  rune: '#d77a61',
  realms: '#b5b9d5',     // Purple
  realm: '#99b898',      // Green
  accounts: '#7fc3ec',   // Blue
  account: '#7fc3ec',
  dashboard: '#d95b43', // Red
  default: '#d95b43'     // Red
};

const getPageColor = (pathname: string): string => {
  const pathParts = pathname.split("/").filter(Boolean);
  const pageType = pathParts[0] || 'default';
  // Map to correct key
  if (pathname.startsWith('/ui/admin/accounts')) return pageColorMap.accounts;
  if (pathname.startsWith('/ui/admin/realms')) return pageColorMap.realms;
  if (pathname.startsWith('/ui/runes')) return pageColorMap.runes;
  if (pathname.startsWith('/ui/realm')) return pageColorMap.realm;
  if (pathname === '/ui' || pathname === '/ui/') return pageColorMap.dashboard;
  return pageColorMap.default;
};

type LayoutProps = {
  children: React.ReactNode;
};

// Pages that should not show the navbar (auth pages, etc.)
const HIDE_NAVBAR_ROUTES = ["/login", "/onboarding"];

export const Layout = ({ children }: LayoutProps) => {
  const pageContext = usePageContext();
  const currentPath = pageContext.urlPathname;
  const showNavbar = !HIDE_NAVBAR_ROUTES.some((route) =>
    currentPath.startsWith(route)
  );
  const pageColor = getPageColor(currentPath);

  return (
    <AppProviders>
      <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
        {showNavbar && <Navbar />}
        <main className="min-h-screen">{children}</main>
      </div>
    </AppProviders>
  );
};
