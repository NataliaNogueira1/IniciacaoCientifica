import React, { forwardRef } from "react";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, id, options, placeholder, error, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={id} className="text-sm font-semibold text-yellow-950">
          {label}
          {required && (
            <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          )}
        </label>
        <div className="relative w-full">
          <select
            ref={ref}
            id={id}
            name={id}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={[
              "w-full appearance-none rounded-md border px-3 py-2 pr-9 text-sm text-yellow-950 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
              "transition-colors duration-150 cursor-pointer",
              error ? "border-red-500 focus:ring-red-400" : "border-gray-300",
              className ?? "",
            ].join(" ")}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Chevron SVG — mesmo estilo dos browsers modernos */}
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{
              position: "absolute",
              right: "0.6rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: "#78350f",
              pointerEvents: "none",
            }}
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
export default SelectField;
