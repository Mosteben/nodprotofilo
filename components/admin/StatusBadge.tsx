import { cn } from "@/lib/utils";

const STYLES = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  featured: "bg-gold/15 text-gold-dark border-gold/30",
  unread: "bg-navy text-white border-navy",
} as const;

const LABELS: Record<keyof typeof STYLES, string> = {
  published: "منشور",
  draft: "مسودة",
  featured: "مميّز",
  unread: "جديدة",
};

export function StatusBadge({ status, className }: { status: keyof typeof STYLES; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-ui text-xs font-medium whitespace-nowrap",
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
