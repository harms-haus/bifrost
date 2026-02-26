import { useState, useEffect } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "@/lib/auth";
import { ApiClient } from "@/lib/api";

const api = new ApiClient();

/**
 * Login page for authentication with PAT.
 */
export function Page() {
  const { isAuthenticated, login } = useAuth();
  const [pat, setPat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check onboarding status and redirect if needed
  useEffect(() => {
    api.checkOnboarding()
      .then((result) => {
        if (result.needs_onboarding) {
          navigate("/ui/onboarding");
        } else {
          setCheckingOnboarding(false);
        }
      })
      .catch(() => {
        setCheckingOnboarding(false);
      });
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      navigate("/ui/dashboard");
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pat.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await login(pat.trim());
      // Navigation will happen via the useEffect when isAuthenticated changes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form if already authenticated or checking onboarding
  if (isAuthenticated || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-white">
            Bifrost
          </h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in with your Personal Access Token
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="pat"
              className="block text-sm font-medium text-slate-300"
            >
              Personal Access Token
            </label>
            <input
              id="pat"
              name="pat"
              type="password"
              required
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your PAT"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
