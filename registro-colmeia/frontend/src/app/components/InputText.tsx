import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  showToggle?: boolean; // mostra botão de olho para campos de senha
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ label, id, error, required, className, showToggle, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showToggle ? (visible ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={id} className="text-sm font-semibold text-yellow-950">
          {label}
          {required && (
            <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          )}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            name={id}
            type={inputType}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={[
              "w-full rounded-md border px-3 py-2 text-sm text-yellow-950 bg-white",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
              "transition-colors duration-150",
              // Remove o olho nativo do browser em campos de senha
              "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden",
              isPassword && showToggle ? "pr-10" : "",
              error ? "border-red-500 focus:ring-red-400" : "border-gray-300",
              className ?? "",
            ].join(" ")}
            {...props}
          />
          {isPassword && showToggle && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-950 transition-colors"
              aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
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
