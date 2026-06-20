import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'neutral' | 'subtle';
  size?: 'medium' | 'small';
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

const VARIANT: Record<string, string> = {
  primary: 'bg-brand-primary text-on-brand hover:bg-brand-hover',
  neutral: 'bg-surface-bg text-text-primary border border-border-primary hover:bg-surface-hover',
  subtle:  'bg-transparent text-text-primary hover:bg-bg-hover',
};

const SIZE: Record<string, string> = {
  medium: 'px-4 py-2',
  small:  'px-3 py-1.5',
};

export function Button({
  variant = 'primary',
  size = 'medium',
  iconStart,
  iconEnd,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-corner-full text-label transition-colors',
        VARIANT[variant],
        SIZE[size],
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {iconStart && <span className="flex-shrink-0 flex">{iconStart}</span>}
      {children != null && <span>{children}</span>}
      {iconEnd && <span className="flex-shrink-0 flex">{iconEnd}</span>}
    </button>
  );
}
