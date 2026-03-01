"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "bifrost-theme";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsDark(stored === "dark");
    }
    setMounted(true);
  }, []);

  // Sync to localStorage and documentElement
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Prevent hydration mismatch - always provide context
  const value = { isDark, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
