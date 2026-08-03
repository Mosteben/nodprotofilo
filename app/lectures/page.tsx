import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LECTURES } from "@/lib/constants/content";

export const metadata: Metadata = {
  title: "المحاضرات",
  description: "محاضرات ومقاطع فيديو تعليمية مبسّطة من قناة نادين محمد على يوتيوب.",
};

export default function LecturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="القناة التعليمية"
        title="المحاضرات"
        description="فيديوهات مبسّطة عن العلوم، وطرق المذاكرة، ومهارات الكتابة."
      />
      <section className="section-py">
        <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LECTURES.map((lecture, i) => (
            <RevealOnScroll key={lecture.slug} delay={(i % 3) * 0.08}>
              <Link
                href={`/lectures/${lecture.slug}`}
                className="group block rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500 h-full"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-navy/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-14 w-14 text-white" />
                  </div>
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-ui px-2 py-1 rounded">
                    {lecture.duration}
                  </span>
                  <span className="absolute top-3 right-3 bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full">
                    {lecture.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-brown/80 text-sm leading-relaxed line-clamp-2">{lecture.description}</p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </>
  );
}
