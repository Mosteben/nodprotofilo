import Image from "next/image";
import Link from "next/link";
import { PlayCircle, ArrowLeft } from "lucide-react";
import { LECTURES } from "@/lib/constants/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function LatestVideos() {
  return (
    <section className="section-py bg-section">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="من القناة"
            title="أحدث المحاضرات"
            description="فيديوهات تعليمية قصيرة أشرح فيها أفكارًا علمية ودراسية."
          />
          <Link
            href="/lectures"
            className="link-underline font-ui text-navy font-medium flex items-center gap-2 mb-12"
          >
            كل المحاضرات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {LECTURES.map((lecture, i) => (
            <RevealOnScroll key={lecture.slug} delay={i * 0.1}>
              <Link
                href={`/lectures/${lecture.slug}`}
                className="group block rounded-2xl overflow-hidden bg-paper shadow-soft"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-navy/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-14 w-14 text-white" />
                  </div>
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-ui px-2 py-1 rounded">
                    {lecture.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-navy leading-snug group-hover:text-gold-dark transition-colors">
                    {lecture.title}
                  </h3>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
