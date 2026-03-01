import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

const STORAGE_KEY = "bifrost-realm";

interface RealmContextValue {
  currentRealm: string | null;
  setCurrentRealm: (realm: string | null) => void;
  availableRealms: string[];
  isLoading: boolean;
}

const RealmContext = createContext<RealmContextValue | undefined>(undefined);

export function RealmProvider({ children }: { children: ReactNode }) {
  const [currentRealm, setCurrentRealmState] = useState<string | null>(null);
  const [availableRealms, setAvailableRealms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { realms: sessionRealms, isAuthenticated, loading: authLoading } = useAuth();

  // Load available realms and restore persisted realm
  useEffect(() => {
    const applyRealmSelection = (realms: string[]) => {
      setAvailableRealms(realms);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && realms.includes(stored)) {
        setCurrentRealmState(stored);
      } else if (realms.length > 0) {
        setCurrentRealmState(realms[0]);
      } else {
        setCurrentRealmState(null);
      }
    };

    const init = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setAvailableRealms([]);
        setCurrentRealmState(null);
        setIsLoading(false);
        return;
      }

      const fallbackRealms = sessionRealms.filter((id) => id !== "_admin");

      try {
        const realms = await api.getRealms();
        const filteredRealms = realms
          .map((realm) => realm.id)
          .filter((id) => id !== "_admin");

        applyRealmSelection(filteredRealms.length > 0 ? filteredRealms : fallbackRealms);
      } catch (err) {
        console.error("Failed to load realms:", err);
        applyRealmSelection(fallbackRealms);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [authLoading, isAuthenticated, sessionRealms]);

  const setCurrentRealm = (realm: string | null) => {
    setCurrentRealmState(realm);
    if (realm) {
      localStorage.setItem(STORAGE_KEY, realm);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <RealmContext.Provider
      value={{ currentRealm, setCurrentRealm, availableRealms, isLoading }}
    >
      {children}
    </RealmContext.Provider>
  );
}

export function useRealm() {
  const context = useContext(RealmContext);
  if (context === undefined) {
    throw new Error("useRealm must be used within a RealmProvider");
  }
  return context;
}
