import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-paper border border-dashed border-navy/15 py-16 px-6 text-center">
      <Icon className="h-10 w-10 text-gold-dark/70 mx-auto mb-4" />
      <h2 className="font-display text-2xl text-navy mb-2">{title}</h2>
      {description && <p className="font-ui text-sm text-navy/60 mb-6">{description}</p>}
      {action}
    </div>
  );
}
