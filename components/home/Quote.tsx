import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Quote({ text, author }: { text: string; author: string }) {
  return (
    <section className="bg-navy text-white section-py relative overflow-hidden">
      <span className="absolute -top-10 right-10 font-display text-[220px] text-white/5 select-none leading-none" aria-hidden="true">
        &ldquo;
      </span>
      <div className="container-narrow text-center relative z-10 px-6">
        <RevealOnScroll>
          <blockquote>
            <p className="font-display text-3xl md:text-4xl leading-relaxed text-gold-light whitespace-pre-line">{text}</p>
            {author && <footer className="mt-6 font-ui text-white/60">— {author}</footer>}
          </blockquote>
        </RevealOnScroll>
      </div>
    </section>
  );
}
