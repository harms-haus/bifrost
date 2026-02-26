import { useEffect, useCallback } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: (id: string) => void;
  duration?: number;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  warning: "bg-yellow-600",
  info: "bg-blue-600",
};

export function Toast({
  id,
  message,
  variant,
  onDismiss,
  duration = 5000,
}: ToastProps) {
  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleDismiss]);

  return (

    <div
      role="alert"
      className={`
        flex items-center justify-between
        px-4 py-3 shadow-lg
        text-white font-medium
        ${variantClasses[variant]}
      `}
    >
      <span>{message}</span>
      <button
        onClick={handleDismiss}
        className="ml-4 text-white/80 hover:text-white focus:outline-none"
        aria-label="Dismiss"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
