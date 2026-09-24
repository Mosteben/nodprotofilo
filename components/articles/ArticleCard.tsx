import Link from "next/link";
import { Clock } from "lucide-react";
import type { ArticleSummary } from "@/lib/data/articles";
import { CoverImage } from "@/components/shared/CoverImage";
import { formatDate } from "@/lib/utils";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500 h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverImage
          src={article.coverImage}
          alt={article.title}
          className="transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        {article.category && (
          <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full">
            {article.category}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">
          {article.title}
        </h3>
        <p className="text-brown/80 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-navy/50 font-ui">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingMinutes} دقائق قراءة
          </span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, "short")}</time>
        </div>
      </div>
    </Link>
  );
}
