import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export type TimelineEntry = { year: string; title: string; description: string };

export function Timeline({ items }: { items: TimelineEntry[] }) {
  return (
    <ol className="relative border-e-2 border-gold/30 pe-8 space-y-12">
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="relative">
          <RevealOnScroll delay={i * 0.1}>
            <span className="absolute top-1 -end-[calc(2rem+7px)] h-3.5 w-3.5 rounded-full bg-gold ring-4 ring-paper" aria-hidden="true" />
            {item.year && <span className="marginalia text-base">{item.year}</span>}
            <h3 className="font-display text-xl text-navy mt-1 mb-2">{item.title}</h3>
            {item.description && <p className="text-brown/80 leading-relaxed max-w-xl">{item.description}</p>}
          </RevealOnScroll>
        </li>
      ))}
    </ol>
  );
}
