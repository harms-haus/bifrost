import { InputHTMLAttributes } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

export function Input({
  type = "text",
  label,
  error,
  errorMessage,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const baseClasses = `
    w-full px-3 py-2
    bg-slate-700 border
    text-white placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-[var(--page-color)] focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  const borderClasses = error
    ? "border-red-500 focus:ring-red-500"
    : "border-slate-600 hover:border-slate-500";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`${baseClasses} ${borderClasses} ${className}`}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
