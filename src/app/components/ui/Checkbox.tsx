import { useState } from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  label?: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, description, defaultChecked = false, checked, onChange, disabled }: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <label
      className={`flex items-start gap-2 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={toggle}
    >
      <div className="flex-shrink-0 mt-1">
        <div
          className="w-5 h-5 rounded-corner-sm border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isChecked ? 'var(--brand-primary)' : 'var(--border-primary)',
            background: isChecked ? 'var(--brand-primary)' : 'var(--surface-bg)',
          }}
        >
          {isChecked && <Check className="w-3 h-3 text-on-brand" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {label && <span className="text-label-sm text-text-primary">{label}</span>}
        {description && <span className="text-video-title text-text-secondary">{description}</span>}
      </div>
    </label>
  );
}
