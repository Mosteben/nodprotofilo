import { TIMELINE } from "@/lib/constants/content";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Timeline() {
  return (
    <ol className="relative border-e-2 border-gold/30 pe-8 space-y-12">
      {TIMELINE.map((item, i) => (
        <RevealOnScroll key={item.year} delay={i * 0.1}>
          <li className="relative">
            <span className="absolute top-1 -end-[calc(2rem+7px)] h-3.5 w-3.5 rounded-full bg-gold ring-4 ring-paper" />
            <span className="marginalia text-base">{item.year}</span>
            <h3 className="font-display text-xl text-navy mt-1 mb-2">{item.title}</h3>
            <p className="text-brown/80 leading-relaxed max-w-xl">{item.description}</p>
          </li>
        </RevealOnScroll>
      ))}
    </ol>
  );
}
