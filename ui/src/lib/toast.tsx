"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (title: string, description?: string, type?: ToastType) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

const toastStyles: Record<ToastType, string> = {
  success: "border-green-500 bg-green-50 dark:bg-green-900/20",
  error: "border-red-500 bg-red-50 dark:bg-red-900/20",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

const iconStyles: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastType = "info") => {
      const id = generateId();
      const toast: Toast = { id, title, description, type };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 10000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`border-l-4 p-4 rounded shadow-lg min-w-[300px] max-w-[400px] ${toastStyles[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{iconStyles[toast.type]}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
