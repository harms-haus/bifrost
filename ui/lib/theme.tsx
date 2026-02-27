import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Theme context type
interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Storage key for theme
const THEME_STORAGE_KEY = "bifrost_theme";

/**
 * Get initial theme from localStorage or default to dark mode
 */
function getInitialTheme(): boolean {
  // Check for localStorage availability (SSR guard)
  if (typeof window === "undefined") {
    return true; // Default to dark mode on server
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light") {
    return false;
  }
  if (stored === "dark") {
    return true;
  }

  // Default to dark mode
  return true;
}

/**
 * Apply theme classes to document root
 */
function applyTheme(isDark: boolean): void {
  if (typeof window === "undefined") {
    return; // Don't try to access DOM on server
  }

  const { classList } = document.documentElement;

  if (isDark) {
    classList.add("dark");
    classList.remove("light");
  } else {
    classList.add("light");
    classList.remove("dark");
  }
}

/**
 * ThemeProvider wraps the app and provides theme state.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Apply theme class when isDark changes
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newIsDark = !prev;

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, newIsDark ? "dark" : "light");
      }

      return newIsDark;
    });
  }, []);

  const value: ThemeContextValue = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme hook provides theme state and actions.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
