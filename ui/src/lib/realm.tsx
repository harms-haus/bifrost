import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";

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

  // Load available realms and restore persisted realm
  useEffect(() => {
    const init = async () => {
      try {
        const realms = await api.getRealms();
        // Filter out _admin realm
        const filteredRealms = realms
          .map((r) => r.id)
          .filter((id) => id !== "_admin");
        setAvailableRealms(filteredRealms);

        // Restore from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && filteredRealms.includes(stored)) {
          setCurrentRealmState(stored);
        } else if (filteredRealms.length > 0) {
          // Default to first available realm
          setCurrentRealmState(filteredRealms[0]);
        }
      } catch (err) {
        console.error("Failed to load realms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

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
