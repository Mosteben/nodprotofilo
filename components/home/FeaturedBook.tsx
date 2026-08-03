import Image from "next/image";
import { BookOpen, Download } from "lucide-react";
import { BOOKS } from "@/lib/constants/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";

export function FeaturedBook() {
  const book = BOOKS.find((b) => b.featured) ?? BOOKS[0];

  return (
    <section className="section-py bg-section">
      <div className="container grid lg:grid-cols-2 gap-16 items-center">
        <RevealOnScroll className="order-2 lg:order-1">
          <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl bg-gold/20" />
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-soft">
              <Image src={book.cover} alt={book.title} fill className="object-cover" />
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15} className="order-1 lg:order-2">
          <SectionHeading eyebrow="الكتاب الأحدث" title={book.title} />
          <p className="text-brown/80 leading-relaxed text-lg mb-8 -mt-8">
            {book.description}
          </p>
          <div className="flex items-center gap-6 mb-8 font-ui text-sm text-navy/60">
            <span>{book.pages} صفحة</span>
            <span className="h-1 w-1 rounded-full bg-navy/30" />
            <span className="text-gold-dark font-semibold text-lg">{book.price}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="md">
              <BookOpen className="h-5 w-5" />
              اطلبي الكتاب
            </Button>
            <Button variant="outline" size="md">
              <Download className="h-5 w-5" />
              نسخة تجريبية
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
