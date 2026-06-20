import React from "react";

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  description?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (value: string) => void;
}

export function InputField({ label, description, prefix, suffix, onChange, ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-label-sm text-text-primary">{label}</label>}
      {description && <p className="text-video-title text-text-secondary">{description}</p>}
      <div className="flex items-center gap-1.5 bg-input-bg rounded-corner-md border border-border-primary px-2 py-1.5 focus-within:border-border-selected transition-colors">
        {prefix && <span className="text-text-tertiary flex-shrink-0 flex">{prefix}</span>}
        <input
          {...props}
          className="flex-1 bg-transparent text-input text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
          onChange={(e) => onChange?.(e.target.value)}
        />
        {suffix && <span className="text-text-tertiary flex-shrink-0 flex">{suffix}</span>}
      </div>
    </div>
  );
}
