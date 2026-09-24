import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Download, ShoppingBag } from "lucide-react";
import { getBookBySlug, getPublishedBooks } from "@/lib/data/collections";
import { decodeSlug } from "@/lib/slug";
import { SITE } from "@/lib/constants/site";
import { jsonLdScript } from "@/lib/json-ld";
import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/shared/CoverImage";
import { Comments } from "@/components/comments/Comments";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedBooks()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBookBySlug(decodeSlug((await params).slug));
  if (!book) return { title: "كتاب غير موجود" };
  const description = book.description ?? `${book.title}${book.author ? ` — ${book.author}` : ""}`;
  return {
    title: book.title,
    description,
    alternates: { canonical: `/books/${book.slug}` },
    openGraph: {
      type: "book",
      title: book.title,
      description,
      images: book.cover_image_url ? [{ url: book.cover_image_url, alt: book.title }] : undefined,
    },
  };
}

export default async function BookPage({ params }: Props) {
  const book = await getBookBySlug(decodeSlug((await params).slug));
  if (!book) notFound();

  const facts = [
    { label: "المؤلف", value: book.author },
    { label: "سنة النشر", value: book.publication_year?.toString() },
    { label: "عدد الصفحات", value: book.pages ? `${book.pages} صفحة` : null },
    { label: "التصنيف", value: book.category },
    { label: "السعر / الحالة", value: book.price_label },
  ].filter((f) => f.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.author ? { "@type": "Person", name: book.author } : undefined,
    image: book.cover_image_url ?? undefined,
    numberOfPages: book.pages ?? undefined,
    datePublished: book.publication_year?.toString(),
    url: `${SITE.url}/books/${book.slug}`,
  };

  return (
    <>
      <article className="container py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
        <nav className="text-sm font-ui text-navy/50 mb-10" aria-label="مسار التصفح">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-gold-dark transition-colors">الرئيسية</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/books" className="hover:text-gold-dark transition-colors">الكتب</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-navy font-medium" aria-current="page">{book.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[0.7fr_1fr] gap-16 items-start">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-soft max-w-sm mx-auto lg:mx-0 border border-gold-dark/20">
            <CoverImage src={book.cover_image_url} alt={book.title} priority sizes="384px" />
          </div>

          <div>
            {book.category && (
              <span className="inline-block mb-3 text-sm font-ui text-gold-dark bg-gold-dark/10 px-3 py-1 rounded-full">{book.category}</span>
            )}
            <h1 className="font-display text-4xl md:text-5xl text-navy mb-6 leading-tight">{book.title}</h1>
            {book.description && <p className="text-lg leading-loose text-ink/80 mb-8 whitespace-pre-line">{book.description}</p>}

            {facts.length > 0 && (
              <dl className="flex flex-wrap items-center gap-4 mb-10 font-ui">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-xl bg-section px-5 py-3">
                    <dt className="text-xs text-navy/50 mb-1">{f.label}</dt>
                    <dd className="font-semibold text-navy">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {(book.purchase_url || book.sample_url) && (
              <div className="flex flex-wrap gap-4">
                {book.purchase_url && (
                  <Button href={book.purchase_url} variant="primary" size="lg">
                    <ShoppingBag className="h-5 w-5" />
                    اطلب نسختك
                  </Button>
                )}
                {book.sample_url && (
                  <Button href={book.sample_url} variant="outline" size="lg">
                    <Download className="h-5 w-5" />
                    قراءة فصل تجريبي
                  </Button>
                )}
              </div>
            )}

            {!book.purchase_url && !book.sample_url && (
              <div className="mt-2 rounded-2xl bg-section p-6 flex items-start gap-4 border border-gold-dark/10">
                <BookOpen className="h-6 w-6 text-gold-dark shrink-0 mt-1" />
                <p className="text-sm text-navy/70 leading-loose font-ui">روابط الشراء والفصل التجريبي ستتوفر قريبًا.</p>
              </div>
            )}
          </div>
        </div>
      </article>
      <Comments contentType="book" contentId={book.id} />
    </>
  );
}
