import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CoverImage } from "@/components/shared/CoverImage";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { featuredFirst, getPublishedBooks } from "@/lib/data/collections";

export const revalidate = 3600;

const description = "كتب وروايات قرأتها وأنصح بها، وإصداراتي.";

export const metadata: Metadata = {
  title: "الكتب",
  description,
  alternates: { canonical: "/books" },
  openGraph: { title: "الكتب", description },
};

export default async function BooksPage() {
  const books = featuredFirst(await getPublishedBooks());

  return (
    <>
      <PageHeader eyebrow="الإصدارات" title="الكتب" description="مجموعة من الكتب التي قرأتها وأعجبتني" />
      <section className="section-py">
        <div className="container">
          {books.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد كتب منشورة بعد — عودي قريبًا.</p>
          ) : (
            <>
              {/* Bookshelf: a wooden-toned shelf line beneath the row of covers */}
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-4">
                {books.map((book, i) => (
                  <li key={book.id}>
                    <RevealOnScroll delay={(i % 3) * 0.1}>
                      <Link href={`/books/${book.slug}`} className="group block">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-soft mb-5 transition-transform duration-500 group-hover:-translate-y-2">
                          <CoverImage src={book.cover_image_url} alt={book.title} priority={i < 3} sizes="(min-width:1024px) 33vw, 50vw" />
                          <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-navy rounded-full px-5 py-2 font-ui text-sm flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> عرض التفاصيل
                            </span>
                          </div>
                        </div>
                        <h2 className="font-display text-xl text-navy group-hover:text-gold-dark transition-colors">{book.title}</h2>
                        {(book.author || book.price_label) && (
                          <p className="text-gold-dark font-ui text-sm mt-1">{[book.author, book.price_label].filter(Boolean).join(" · ")}</p>
                        )}
                      </Link>
                    </RevealOnScroll>
                  </li>
                ))}
              </ul>
              <div className="h-3 rounded-full bg-brown/40 shadow-soft" aria-hidden="true" />
            </>
          )}
        </div>
      </section>
    </>
  );
}
