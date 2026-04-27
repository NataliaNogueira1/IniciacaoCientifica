import React, { forwardRef } from "react";

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ label, id, error, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-yellow-950"
        >
          {label}
          {required && (
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={id}
          name={id}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "w-full rounded-md border px-3 py-2 text-sm text-yellow-950 bg-white",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
            "transition-colors duration-150",
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputText.displayName = "InputText";
export default InputText;
