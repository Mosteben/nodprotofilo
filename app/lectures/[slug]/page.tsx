import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LECTURES } from "@/lib/constants/content";

export function generateStaticParams() {
  return LECTURES.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const lecture = LECTURES.find((l) => l.slug === params.slug);
  if (!lecture) return {};
  return { title: lecture.title, description: lecture.description };
}

export default function LecturePage({ params }: { params: { slug: string } }) {
  const lecture = LECTURES.find((l) => l.slug === params.slug);
  if (!lecture) notFound();

  return (
    <article className="container-narrow py-16">
      <nav className="text-sm font-ui text-navy/50 mb-8" aria-label="مسار التصفح">
        <Link href="/lectures" className="hover:text-gold-dark">المحاضرات</Link> / {lecture.title}
      </nav>

      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft mb-8">
        <iframe
          src={`https://www.youtube.com/embed/${lecture.youtubeId}`}
          title={lecture.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <span className="marginalia text-gold-dark mb-3 inline-block">— {lecture.category}</span>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-4">{lecture.title}</h1>
      <p className="text-lg leading-loose text-ink/80">{lecture.description}</p>
    </article>
  );
}
