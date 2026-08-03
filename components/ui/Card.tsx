import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500",
        className
      )}
    >
      {children}
    </div>
  );
}
