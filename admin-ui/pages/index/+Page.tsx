import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ApiClient } from "@/lib/api";

const api = new ApiClient();

/**
 * Root page that redirects based on authentication and onboarding status.
 */
export function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading or on server
    if (isLoading || typeof window === "undefined") {
      return;
    }

    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Not authenticated - check onboarding status
    setCheckingOnboarding(true);
    api
      .checkOnboarding()
      .then((result) => {
        if (result.needs_onboarding) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      })
      .catch(() => {
        // On error, default to login
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setCheckingOnboarding(false);
      });
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking auth or onboarding
  if (isLoading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Return null while redirecting (prevents flash)
  return null;
}
