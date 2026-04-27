"use client";

import React from "react";

interface BeeButtonProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function BeeButton({
  title,
  loading = false,
  disabled = false,
  onClick,
  className = "",
}: BeeButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-lg px-6 py-2.5 font-semibold text-base",
        "bg-amber-400 text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
        "transition-colors duration-150",
        isDisabled ? "cursor-not-allowed opacity-70" : "hover:bg-amber-500",
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Enviando…</span>
        </>
      ) : (
        title
      )}
    </button>
  );
}
