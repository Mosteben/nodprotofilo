"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Clock } from "lucide-react";
import type { Article } from "@/types";
import { readingTime, cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const PAGE_SIZE = 6;

export function ArticlesExplorer({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("الكل");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles]
  );

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesQuery =
        a.title.includes(query) || a.excerpt.includes(query) || a.tags.some((t) => t.includes(query));
      const matchesCategory = category === "الكل" || a.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [articles, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحثي عن مقالة، كلمة مفتاحية..."
            className="w-full h-12 rounded-full bg-section pe-12 ps-5 outline-none border border-navy/10 focus-visible:border-gold"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={cn(
                "h-12 px-5 rounded-full font-ui text-sm border transition-colors",
                category === c
                  ? "bg-navy text-white border-navy"
                  : "border-navy/10 text-navy/70 hover:border-gold"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-navy/50 py-20 font-ui">
          لا توجد مقالات مطابقة لبحثك — جرّبي كلمة أخرى.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((article, i) => (
            <RevealOnScroll key={article.slug} delay={(i % 3) * 0.08}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500 h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-brown/80 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-navy/50 font-ui">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {readingTime(article.wordCount)} دقائق قراءة
                    </span>
                    <span>{new Date(article.publishedAt).toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-14">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "h-10 w-10 rounded-full font-ui text-sm transition-colors",
                p === page ? "bg-gold text-navy" : "bg-section text-navy/60 hover:bg-navy/10"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
