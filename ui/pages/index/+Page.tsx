import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { navigate } from "vike/client/router";
import { useAuth } from "@/lib/auth";
import { TopNav } from "@/components/TopNav/TopNav";

/**
 * Root page that shows TopNav for non-authenticated users or redirects to dashboard for authenticated users.
 */
export const Page = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while auth is loading or on server
    if (isLoading || typeof window === "undefined") {
      return;
    }

    // If authenticated, redirect to dashboard (avoid infinite loop if already there)
    if (isAuthenticated && location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, location.pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show TopNav with redirect message
  return (
    <div className="index-page">
      <TopNav />
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white border-2 border-slate-300 shadow-soft">
          <h1 className="text-2xl font-bold mb-4">Welcome to Bifrost</h1>
          <p className="text-slate-600">
            You are being redirected to the dashboard. If redirect doesn&apos;t happen automatically, please log in to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
