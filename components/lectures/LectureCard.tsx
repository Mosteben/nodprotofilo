import Link from "next/link";
import { PlayCircle, ExternalLink } from "lucide-react";
import type { LectureRow } from "@/types/database";
import { youTubeThumbnail } from "@/lib/youtube";
import { CoverImage } from "@/components/shared/CoverImage";
import { toPlainText } from "@/lib/text";

export function lectureThumbnail(lecture: LectureRow): string | null {
  return lecture.thumbnail_url ?? (lecture.youtube_id ? youTubeThumbnail(lecture.youtube_id) : null);
}

export function LectureCard({ lecture, priority = false }: { lecture: LectureRow; priority?: boolean }) {
  return (
    <Link
      href={`/lectures/${lecture.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500 h-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <CoverImage
          src={lectureThumbnail(lecture)}
          alt={lecture.title}
          priority={priority}
          className="transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-navy/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {lecture.youtube_id ? <PlayCircle className="h-14 w-14 text-white" /> : <ExternalLink className="h-10 w-10 text-white" />}
        </div>
        {lecture.duration && (
          <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-ui px-2 py-1 rounded" dir="ltr">
            {lecture.duration}
          </span>
        )}
        {lecture.category && (
          <span className="absolute top-3 right-3 bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full">{lecture.category}</span>
        )}
      </div>
      <div className="p-6 flex-1">
        <h3 className="font-display text-lg text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">{lecture.title}</h3>
        {lecture.description && <p className="text-brown/80 text-sm leading-relaxed line-clamp-2">{toPlainText(lecture.description)}</p>}
      </div>
    </Link>
  );
}
