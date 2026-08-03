import { Mail } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  return (
    <section className="section-py">
      <div className="container">
        <RevealOnScroll className="rounded-3xl bg-gold-fade p-10 md:p-16 text-navy relative overflow-hidden">
          <Mail className="absolute -left-6 -bottom-6 h-40 w-40 text-navy/10" />
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl mb-3">
              اشتركي في النشرة البريدية
            </h2>
            <p className="text-navy/70 mb-8 leading-relaxed">
              مقال جديد ومصدر تعليمي مختار، كل أسبوعين في بريدك — بدون إزعاج.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                البريد الإلكتروني
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="بريدك الإلكتروني"
                className="flex-1 h-14 rounded-full px-6 bg-white/80 placeholder:text-navy/40 focus:bg-white outline-none border border-navy/10 focus-visible:border-navy transition-colors"
              />
              <Button type="submit" variant="primary" size="lg">
                اشتركي الآن
              </Button>
            </form>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
