import { Loader2 } from "lucide-react";

export function Loading({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
        <p className="text-label-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
