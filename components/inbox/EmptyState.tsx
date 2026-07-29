import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "accent",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "accent" | "neutral";
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 py-16 text-center">
      <div
        className={`flex size-18 items-center justify-center rounded-3xl border ${
          tone === "accent"
            ? "border-accent-tint-border bg-accent-tint/60"
            : "border-border-subtle bg-frame"
        }`}
      >
        <Icon
          size={30}
          strokeWidth={1.25}
          className={tone === "accent" ? "text-accent" : "text-ink-muted"}
        />
      </div>
      <div className="text-lg font-semibold text-ink">{title}</div>
      {description && (
        <p className="max-w-85 text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
