interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'secondary';
}

const VARIANT: Record<string, string> = {
  default:   'bg-bg-subtle text-text-secondary',
  success:   'bg-[var(--status-success-bg)] text-[var(--status-success)]',
  warning:   'bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
  danger:    'bg-[var(--status-danger-bg)] text-[var(--status-danger)]',
  brand:     'bg-brand-secondary text-brand-primary',
  secondary: 'bg-bg-faint text-text-tertiary',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-corner-md text-video-title font-medium ${VARIANT[variant]}`}>
      {label}
    </span>
  );
}
