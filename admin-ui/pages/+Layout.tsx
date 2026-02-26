import "./Layout.css";

import "./tailwind.css";
import { AppProviders } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { usePageContext } from "vike-react/usePageContext";

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

  return (
    <AppProviders>
      <div className="min-h-screen bg-slate-900">
        {showNavbar && <Navbar />}
        <main>{children}</main>
      </div>
    </AppProviders>
  );
};
