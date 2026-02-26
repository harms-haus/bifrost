import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ApiClient, ApiError } from "./api";
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

interface RealmContextValue {
  selectedRealm: string | null;
  availableRealms: string[];
  setRealm: (realmId: string) => void;
  role: string | null;
}

// Create contexts
const AuthContext = createContext<AuthContextValue | null>(null);
const RealmContext = createContext<RealmContextValue | null>(null);

// Storage key for realm selection
const REALM_STORAGE_KEY = "bifrost_selected_realm";

// API client instance
const api = new ApiClient();

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
 * RealmProvider manages realm selection state.
 * Must be used within AuthProvider.
 */
export function RealmProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  // Get available realms from session
  const availableRealms = session?.realms ?? [];

  // Initialize selected realm from localStorage or first available
  const getInitialRealm = (): string | null => {
    if (!session || availableRealms.length === 0) return null;

    // Check for localStorage availability (SSR guard)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REALM_STORAGE_KEY);
      if (stored && availableRealms.includes(stored)) {
        return stored;
      }
    }
    return availableRealms[0] ?? null;
  };

  const [selectedRealm, setSelectedRealm] = useState<string | null>(null);

  // Update selected realm when session changes
  useEffect(() => {
    if (session) {
      const initial = getInitialRealm();
      setSelectedRealm(initial);
      if (initial) {
        api.setRealm(initial);
      }
    } else {
      setSelectedRealm(null);
      api.setRealm(null);
    }
  }, [session]);

  const setRealm = useCallback(
    (realmId: string) => {
      if (availableRealms.includes(realmId)) {
        setSelectedRealm(realmId);
        if (typeof window !== "undefined") {
          localStorage.setItem(REALM_STORAGE_KEY, realmId);
        }
        api.setRealm(realmId);
      }
    },
    [availableRealms]
  );

  const role = selectedRealm ? session?.roles[selectedRealm] ?? null : null;

  const value: RealmContextValue = {
    selectedRealm,
    availableRealms,
    setRealm,
    role,
  };

  return (
    <RealmContext.Provider value={value}>{children}</RealmContext.Provider>
  );
}

/**
 * useSession hook returns the current session info.
 */
export function useSession(): SessionInfo | null {
  const { session } = useAuth();
  return session;
}

/**
 * useRealm hook provides realm selection state.
 */
export function useRealm(): RealmContextValue {
  const context = useContext(RealmContext);
  if (!context) {
    throw new Error("useRealm must be used within a RealmProvider");
  }
  return context;
}

/**
 * Combined provider that sets up both Auth and Realm contexts.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RealmProvider>{children}</RealmProvider>
    </AuthProvider>
  );
}
