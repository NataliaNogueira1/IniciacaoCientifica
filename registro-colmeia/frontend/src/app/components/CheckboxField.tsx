import React, { forwardRef } from "react";

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  description?: string;
}

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, id, description, className, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={id}
          aria-describedby={description ? `${id}-desc` : undefined}
          className={[
            "mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-500",
            "focus:ring-2 focus:ring-amber-400 focus:ring-offset-1",
            "accent-amber-500 cursor-pointer",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        <div className="flex flex-col">
          <label htmlFor={id} className="text-sm font-semibold text-yellow-950 cursor-pointer">
            {label}
          </label>
          {description && (
            <span id={`${id}-desc`} className="text-xs text-gray-500">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }
);

CheckboxField.displayName = "CheckboxField";
export default CheckboxField;
