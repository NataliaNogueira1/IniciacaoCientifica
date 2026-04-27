import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function Button({
  title,
  loading = false,
  variant = "primary",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-amber-400 text-gray-900 hover:bg-amber-500 focus:ring-amber-400 disabled:bg-gray-300 disabled:text-gray-500",
    secondary:
      "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-amber-400 disabled:bg-gray-100 disabled:text-gray-400",
  };

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[base, variants[variant], className ?? ""].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Enviando…</span>
        </>
      ) : (
        title
      )}
    </button>
  );
}
