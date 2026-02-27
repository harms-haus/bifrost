import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
    contains: vi.fn(),
  },
};

Object.defineProperty(global.document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should default to dark mode", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(true);
  });

  it("should toggle theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
  });

  it("should persist theme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem("bifrost_theme")).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem("bifrost_theme")).toBe("dark");
  });

  it("should restore theme from localStorage", () => {
    localStorage.setItem("bifrost_theme", "light");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(false);
  });

  it("should apply dark class to document root when isDark is true", () => {
    renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("dark");
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith("light");
  });

  it("should apply light class to document root when isDark is false", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("light");
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith("dark");
  });

  it("should throw error when useTheme is used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});
