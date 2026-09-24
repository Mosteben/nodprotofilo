import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ExternalLink, User } from "lucide-react";
import { getLectureBySlug, getPublishedLectures } from "@/lib/data/collections";
import { decodeSlug } from "@/lib/slug";
import { formatDate } from "@/lib/datetime";
import { youTubeEmbedUrl, youTubeWatchUrl } from "@/lib/youtube";
import { SITE } from "@/lib/constants/site";
import { jsonLdScript } from "@/lib/json-ld";
import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/shared/CoverImage";
import { lectureThumbnail } from "@/components/lectures/LectureCard";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedLectures()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lecture = await getLectureBySlug(decodeSlug((await params).slug));
  if (!lecture) return { title: "محاضرة غير موجودة" };
  const image = lectureThumbnail(lecture);
  return {
    title: lecture.title,
    description: lecture.description ?? lecture.title,
    alternates: { canonical: `/lectures/${lecture.slug}` },
    openGraph: {
      type: lecture.youtube_id ? "video.other" : "website",
      title: lecture.title,
      description: lecture.description ?? undefined,
      images: image ? [{ url: image, alt: lecture.title }] : undefined,
    },
  };
}

export default async function LecturePage({ params }: Props) {
  const lecture = await getLectureBySlug(decodeSlug((await params).slug));
  if (!lecture) notFound();

  const thumbnail = lectureThumbnail(lecture);
  const jsonLd = lecture.youtube_id
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: lecture.title,
        description: lecture.description ?? lecture.title,
        thumbnailUrl: thumbnail ?? undefined,
        uploadDate: lecture.lecture_date ?? lecture.created_at,
        embedUrl: youTubeEmbedUrl(lecture.youtube_id),
        contentUrl: youTubeWatchUrl(lecture.youtube_id),
        url: `${SITE.url}/lectures/${lecture.slug}`,
      }
    : null;

  return (
    <article className="container-narrow py-16 px-6">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />}
      <nav className="text-sm font-ui text-navy/50 mb-8" aria-label="مسار التصفح">
        <ol className="flex items-center gap-2">
          <li><Link href="/lectures" className="hover:text-gold-dark">المحاضرات</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-navy truncate" aria-current="page">{lecture.title}</li>
        </ol>
      </nav>

      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft mb-8 bg-navy-900">
        {lecture.youtube_id ? (
          // The id is validated (11 safe characters), so the src cannot inject markup.
          <iframe
            src={youTubeEmbedUrl(lecture.youtube_id)}
            title={lecture.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <CoverImage src={thumbnail} alt={lecture.title} priority sizes="768px" />
        )}
      </div>

      {lecture.category && <span className="marginalia text-gold-dark mb-3 inline-block">— {lecture.category}</span>}
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-4">{lecture.title}</h1>

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy/50 font-ui mb-6">
        {lecture.speaker && (
          <li className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {lecture.speaker}
          </li>
        )}
        {lecture.lecture_date && (
          <li className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={lecture.lecture_date}>{formatDate(`${lecture.lecture_date}T12:00:00Z`)}</time>
          </li>
        )}
        {lecture.duration && (
          <li className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span dir="ltr">{lecture.duration}</span>
          </li>
        )}
      </ul>

      {lecture.description && <p className="text-lg leading-loose text-ink/80 whitespace-pre-line">{lecture.description}</p>}

      {lecture.external_url && (
        <Button href={lecture.external_url} variant="gold" size="md" className="mt-8">
          <ExternalLink className="h-5 w-5" />
          مشاهدة المحاضرة
        </Button>
      )}
    </article>
  );
}
