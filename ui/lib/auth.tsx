import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, ApiError } from "./api";
import type { SessionInfo, LoginResponse } from "@/types";

// Auth context types
interface AuthContextValue {
  session: SessionInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (pat: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider wraps the app and provides authentication state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on mount
  useEffect(() => {
    refreshSession();
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionInfo = await api.getSession();
      setSession(sessionInfo);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Not authenticated - this is fine
        setSession(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load session");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (pat: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: LoginResponse = await api.login(pat);
      setSession(response);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setSession(null);
    } catch (err) {
      // Even if logout fails, clear local state
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    session,
    isLoading,
    isAuthenticated: session !== null,
    error,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook provides authentication state and actions.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * useSession hook returns the current session info.
 */
export function useSession(): SessionInfo | null {
  const { session } = useAuth();
  return session;
}
