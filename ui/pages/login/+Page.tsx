import { useState, useEffect } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "@/lib/auth";
import { Field } from "@base-ui/react/field";
import { useToast } from "@/lib/use-toast";
import "./+Page.css";

/**
 * Login page for authentication with PAT.
 * Uses neo-brutalist styling with 0% border-radius and bold borders.
 */
export function Page() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [pat, setPat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pat.trim()) {
      toast({
        title: "Login failed",
        description: "Please enter your PAT",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(pat.trim());
      // Navigation will happen via the useEffect when isAuthenticated changes
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (isAuthenticated || authLoading) {
    return (
      <div className="login-loading">
        <div className="login-loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Bifrost</h1>
          <p className="login-subtitle">Sign in with your Personal Access Token</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <Field.Root className="login-field">
            <Field.Label className="login-field-label">
              Personal Access Token
            </Field.Label>
            <Field.Control
              className="login-field-input"
              type="password"
              value={pat}
              onChange={(e) => setPat((e.target as HTMLInputElement).value)}
              placeholder="Enter your PAT"
              disabled={isLoading}
            />
          </Field.Root>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
