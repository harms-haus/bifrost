import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

// Try to import ApiClient, but handle case where it doesn't exist yet
let apiClientInstance: { setRealm: (realm: string | null) => void } | null = null;
try {
  const apiModule = require("./api");
  apiClientInstance = new apiModule.ApiClient();
} catch {
  // ApiClient doesn't exist yet (T9 not completed)
  apiClientInstance = { setRealm: () => {} };
}

const api = apiClientInstance!;

// Realm context types
type RealmContextValue = {
  selectedRealm: string | null;
  availableRealms: string[];
  setRealm: (realmId: string) => void;
  role: string | null;
};

// Mock type for AuthContext (will be provided by AuthProvider)
type AuthContextValue = {
  session: {
    realms: string[];
    roles: Record<string, string>;
  } | null;
};

// Create contexts
const RealmContext = createContext<RealmContextValue | null>(null);

// Mock AuthContext for tests (AuthProvider provides this)
// AuthContext is defined by AuthProvider and exported for RealmProvider to use
export const AuthContext = createContext<AuthContextValue | null>(null);

// Storage key for realm selection
const REALM_STORAGE_KEY = "bifrost_selected_realm";

/**
 * useAuth hook provides authentication state.
 * This is a mock that will be replaced by AuthProvider when it exists.
 */
const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * RealmProvider manages realm selection state.
 * Must be used within AuthProvider.
 */
export function RealmProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  // Get available realms from session, filtering out _admin
  const availableRealms = session?.realms.filter(realm => realm !== "_admin") ?? [];

  // Initialize selected realm from localStorage or first available
  const getInitialRealm = useCallback((): string | null => {
    if (!session || availableRealms.length === 0) {
      return null;
    }

    // Check for localStorage availability (SSR guard)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REALM_STORAGE_KEY);
      if (stored && availableRealms.includes(stored)) {
        return stored;
      }
    }
    return availableRealms[0] ?? null;
  }, [session, availableRealms]);

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
  }, [session, getInitialRealm]);

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
    [availableRealms],
  );

  const role = selectedRealm ? (session?.roles[selectedRealm] ?? null) : null;

  const value = useMemo(
    () => ({
      selectedRealm,
      availableRealms,
      setRealm,
      role,
    }),
    [selectedRealm, availableRealms, setRealm, role],
  );

  return <RealmContext.Provider value={value}>{children}</RealmContext.Provider>;
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
