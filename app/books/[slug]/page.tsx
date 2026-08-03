import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Download, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { BOOKS } from "@/lib/constants/content";

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);

  if (!book) return {};

  return {
    title: `رواية ${book.title}`,
    description: book.description,
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);

  if (!book) notFound();

  return (
    <article className="container py-16">
      {/* Breadcrumb */}
      <nav
        className="text-sm font-ui text-navy/50 mb-10"
        aria-label="مسار التصفح"
      >
        <Link href="/" className="hover:text-gold-dark transition-colors">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>

        <Link href="/books" className="hover:text-gold-dark transition-colors">
          الروايات
        </Link>

        <span className="mx-2">/</span>

        <span className="text-navy font-medium">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[0.7fr_1fr] gap-16 items-start">
        {/* Cover */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-soft max-w-sm mx-auto lg:mx-0 border border-gold-dark/20">
          <Image
            src={book.cover}
            alt={book.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <span className="inline-block mb-3 text-sm font-ui text-gold-dark bg-gold-dark/10 px-3 py-1 rounded-full">
            رواية
          </span>

          <h1 className="font-display text-4xl md:text-5xl text-navy mb-6 leading-tight">
            {book.title}
          </h1>

          <p className="text-lg leading-loose text-ink/80 mb-8">
            {book.description}
          </p>

          <div className="flex flex-wrap items-center gap-5 mb-10 font-ui">
            <div className="rounded-xl bg-section px-5 py-3">
              <p className="text-xs text-navy/50 mb-1">عدد الصفحات</p>
              <p className="font-semibold text-navy">
                {book.pages} صفحة
              </p>
            </div>

            <div className="rounded-xl bg-section px-5 py-3">
              <p className="text-xs text-navy/50 mb-1">الحالة</p>
              <p className="font-semibold text-gold-dark">
                {book.price}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              <ShoppingBag className="h-5 w-5" />
              اطلب نسختك
            </Button>

            <Button variant="outline" size="lg">
              <Download className="h-5 w-5" />
              تحميل الفصل الأول
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-10 rounded-2xl bg-section p-6 flex items-start gap-4 border border-gold-dark/10">
            <BookOpen className="h-6 w-6 text-gold-dark shrink-0 mt-1" />

            <div>
              <h3 className="font-display text-lg text-navy mb-2">
                عن الرواية
              </h3>

              <p className="text-sm text-navy/70 leading-loose font-ui">
                <strong>{book.title}</strong> هي رواية أدبية تأخذ القارئ في
                رحلة إنسانية مليئة بالمشاعر والصراعات والأحلام، حيث تمتزج
                الرومانسية بالغموض في سردٍ هادئ وأسلوبٍ أدبي مميز.
              </p>

              <p className="text-sm text-navy/70 leading-loose mt-3 font-ui">
                سيتوفر قريبًا رابط لشراء الرواية أو تحميل فصل تجريبي منها،
                بالإضافة إلى إمكانية طلب النسخة الورقية مباشرةً من خلال الموقع.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}