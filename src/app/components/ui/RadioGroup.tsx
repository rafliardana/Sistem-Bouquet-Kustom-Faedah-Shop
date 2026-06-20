interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function RadioGroup({ options, value, defaultValue, name, onChange, disabled }: RadioGroupProps) {
  const controlled = value !== undefined;

  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {options.map((option) => {
        const isSelected = controlled ? value === option.value : undefined;
        return (
          <label
            key={option.value}
            className={`flex items-start gap-2 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <div className="flex-shrink-0 mt-1">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={controlled ? isSelected : undefined}
                defaultChecked={!controlled ? defaultValue === option.value : undefined}
                disabled={disabled}
                onChange={() => onChange?.(option.value)}
                className="sr-only"
              />
              <div
                className="w-5 h-5 rounded-corner-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-primary)',
                  background: 'var(--surface-bg)',
                }}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-corner-full" style={{ background: 'var(--brand-primary)' }} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-text-primary">{option.label}</span>
              {option.description && (
                <span className="text-video-title text-text-secondary">{option.description}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
