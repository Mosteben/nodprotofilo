import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { featuredFirst, getPublishedLectures } from "@/lib/data/collections";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LectureCard } from "@/components/lectures/LectureCard";

export async function LatestVideos() {
  const lectures = featuredFirst(await getPublishedLectures()).slice(0, 3);
  if (lectures.length === 0) return null;

  return (
    <section className="section-py bg-section">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="من القناة" title="أحدث المحاضرات" description="فيديوهات تعليمية قصيرة أشرح فيها أفكارًا علمية ودراسية." />
          <Link href="/lectures" className="link-underline font-ui text-navy font-medium flex items-center gap-2 mb-12">
            كل المحاضرات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {lectures.map((lecture, i) => (
            <RevealOnScroll key={lecture.id} delay={i * 0.1} className="h-full">
              <LectureCard lecture={lecture} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
