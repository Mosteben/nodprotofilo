import { BookOpen, ShoppingBag } from "lucide-react";
import { featuredFirst, getPublishedBooks } from "@/lib/data/collections";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/shared/CoverImage";
import { toPlainText } from "@/lib/text";

export async function FeaturedBook() {
  const book = featuredFirst(await getPublishedBooks())[0];
  if (!book) return null;

  return (
    <section className="section-py bg-section">
      <div className="container grid lg:grid-cols-2 gap-16 items-center">
        <RevealOnScroll className="order-2 lg:order-1">
          <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl bg-gold/20" />
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-soft">
              <CoverImage src={book.cover_image_url} alt={book.title} sizes="(min-width: 1024px) 384px, 80vw" />
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15} className="order-1 lg:order-2">
          <SectionHeading eyebrow={book.featured ? "كتاب مميّز" : "من المكتبة"} title={book.title} />
          {book.description && <p className="text-brown/80 leading-relaxed text-lg mb-8 -mt-8 line-clamp-5">{toPlainText(book.description)}</p>}
          {(book.author || book.pages || book.price_label) && (
            <div className="flex flex-wrap items-center gap-4 mb-8 font-ui text-sm text-navy/60">
              {book.author && <span>{book.author}</span>}
              {book.pages && <span>{book.pages} صفحة</span>}
              {book.price_label && <span className="text-gold-dark font-semibold text-lg">{book.price_label}</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <Button href={`/books/${book.slug}`} variant="primary" size="md">
              <BookOpen className="h-5 w-5" />
              تفاصيل الكتاب
            </Button>
            {book.purchase_url && (
              <Button href={book.purchase_url} variant="outline" size="md">
                <ShoppingBag className="h-5 w-5" />
                اطلبي الكتاب
              </Button>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
