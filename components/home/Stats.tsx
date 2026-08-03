import { STATS } from "@/lib/constants/content";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Stats() {
  return (
    <section className="bg-section">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 py-16">
        {STATS.map((stat, i) => (
          <RevealOnScroll key={stat.label} delay={i * 0.08}>
            <div className="text-center border-e border-navy/10 last:border-e-0 px-2">
              <p className="font-display text-4xl md:text-5xl text-navy mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="font-ui text-sm md:text-base text-brown">{stat.label}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
