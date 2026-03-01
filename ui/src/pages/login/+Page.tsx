"use client";

import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";

export { Page };

function Page() {
  const [pat, setPat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      try {
        const onboardingStatus = await api.checkOnboarding();
        if (onboardingStatus.needs_onboarding) {
          navigate("/onboarding");
        }
      } catch {
        if (isMounted) {
          setIsCheckingOnboarding(false);
        }
        return;
      }

      if (isMounted) {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pat.trim()) {
      showToast("Error", "Please enter your PAT", "error");
      return;
    }

    setIsLoading(true);

    try {
      await login(pat.trim());

      // Check onboarding status
      const onboardingStatus = await api.checkOnboarding();

      if (onboardingStatus.needs_onboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      showToast("Login Failed", "Invalid PAT or server error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span style={{ color: "var(--color-red)" }}>BIFROST</span>
          </h1>
          <p className="text-sm uppercase tracking-widest" style={{ color: "var(--color-border)" }}>
            Rune Management
          </p>
        </div>

        {/* Login Card */}
        <div
          className="p-8"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">
            Sign In
          </h2>

          <form onSubmit={handleSubmit}>
            {/* PAT Input */}
            <div className="mb-6">
              <label
                htmlFor="pat"
                className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                style={{ color: "var(--color-border)" }}
              >
                Personal Access Token
              </label>
              <input
                id="pat"
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                placeholder="Enter your PAT"
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                  boxShadow: "var(--shadow-soft)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                  e.currentTarget.style.transform = "translate(2px, 2px)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                  e.currentTarget.style.transform = "translate(0, 0)";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isCheckingOnboarding}
              className="w-full py-3 px-6 text-sm font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-red)",
                border: "2px solid var(--color-border)",
                color: "white",
                boxShadow: "var(--shadow-soft)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                  e.currentTarget.style.transform = "translate(2px, 2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                e.currentTarget.style.transform = "translate(0, 0)";
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft-active)";
                  e.currentTarget.style.transform = "translate(4px, 4px)";
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                e.currentTarget.style.transform = "translate(2px, 2px)";
              }}
            >
              {isCheckingOnboarding
                ? "Checking setup..."
                : isLoading
                  ? "Signing in..."
                  : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
