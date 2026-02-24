import { Navbar } from "./Navbar";

type PageLayoutProps = {
  children: React.ReactNode;
};

/**
 * PageLayout provides consistent page structure with navbar.
 * Wraps all pages with the main navigation and layout.
 */
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="dark flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
