import React from "react";

interface TextareaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  description?: string;
  onChange?: (value: string) => void;
}

export function TextareaField({ label, description, onChange, ...props }: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-label-sm text-text-primary">{label}</label>}
      {description && <p className="text-video-title text-text-secondary">{description}</p>}
      <textarea
        {...props}
        className="bg-input-bg rounded-corner-md border border-border-primary px-2 py-1.5 text-input text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-selected transition-colors resize-none"
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
