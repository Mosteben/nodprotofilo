import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LectureCard } from "@/components/lectures/LectureCard";
import { featuredFirst, getPublishedLectures } from "@/lib/data/collections";

export const revalidate = 3600;

const description = "محاضرات ومقاطع فيديو تعليمية مبسّطة عن العلوم وطرق المذاكرة.";

export const metadata: Metadata = {
  title: "المحاضرات",
  description,
  alternates: { canonical: "/lectures" },
  openGraph: { title: "المحاضرات", description },
};

export default async function LecturesPage() {
  const lectures = featuredFirst(await getPublishedLectures());

  return (
    <>
      <PageHeader eyebrow="القناة التعليمية" title="المحاضرات" description="فيديوهات مبسّطة عن العلوم، وطرق المذاكرة، ومهارات الكتابة." />
      <section className="section-py">
        <div className="container">
          {lectures.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد محاضرات منشورة بعد — عودي قريبًا.</p>
          ) : (
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lectures.map((lecture, i) => (
                <li key={lecture.id}>
                  <RevealOnScroll delay={(i % 3) * 0.08} className="h-full">
                    <LectureCard lecture={lecture} priority={i < 3} />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
