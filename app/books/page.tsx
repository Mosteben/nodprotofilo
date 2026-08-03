import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { BOOKS } from "@/lib/constants/content";

export const metadata: Metadata = {
  title: "الكتب",
  description: "كتب ومطبوعات نادين محمد حول تعليم العلوم والكتابة.",
};

export default function BooksPage() {
  return (
    <>
      <PageHeader
        eyebrow="الإصدارات"
        title="الكتب"
        description="مجموعة من الكتب التي قرأتها واعجبتني"
      />
      <section className="section-py">
        <div className="container">
          {/* Bookshelf: a horizontal wooden-toned shelf line beneath the row of covers */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-4">
            {BOOKS.map((book, i) => (
              <RevealOnScroll key={book.slug} delay={i * 0.1}>
                <Link href={`/books/${book.slug}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-soft mb-5 transition-transform duration-500 group-hover:-translate-y-2">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(min-width:1024px) 33vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-navy rounded-full px-5 py-2 font-ui text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> عرض التفاصيل
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-navy group-hover:text-gold-dark transition-colors">{book.title}</h3>
                  <p className="text-gold-dark font-ui text-sm mt-1">{book.price}</p>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
          <div className="h-3 rounded-full bg-brown/40 shadow-soft" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
