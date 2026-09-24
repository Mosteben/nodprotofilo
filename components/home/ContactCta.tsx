import { Mail, Send } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";

export function ContactCta({ title, text, email }: { title: string; text: string; email: string }) {
  return (
    <section className="section-py">
      <div className="container">
        <RevealOnScroll className="rounded-3xl bg-navy-fade text-white p-10 md:p-16 text-center relative overflow-hidden">
          <Mail className="absolute -left-6 -bottom-6 h-40 w-40 text-white/5" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl mb-4">{title}</h2>
            <p className="text-white/70 leading-relaxed mb-8">{text}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="gold" size="lg">
                <Send className="h-5 w-5" />
                أرسلي رسالة
              </Button>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 h-14 px-6 font-ui text-white/80 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  {email}
                </a>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
