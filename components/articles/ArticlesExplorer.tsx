"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ArticleSummary } from "@/lib/data/articles";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ArticleCard } from "./ArticleCard";

const PAGE_SIZE = 6;
const ALL = "الكل";

export function ArticlesExplorer({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(articles.map((a) => a.category).filter((c): c is string => Boolean(c))))],
    [articles]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return articles.filter((a) => {
      const matchesQuery =
        !q || a.title.includes(q) || a.excerpt.includes(q) || a.tags.some((t) => t.includes(q));
      const matchesCategory = category === ALL || a.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [articles, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <label htmlFor="article-search" className="sr-only">
            ابحثي في المقالات
          </label>
          <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحثي عن مقالة، كلمة مفتاحية..."
            className="w-full h-12 rounded-full bg-section pe-12 ps-5 outline-none border border-navy/10 focus-visible:border-gold"
          />
        </div>
        {categories.length > 2 && (
          <div className="flex gap-2 flex-wrap" role="group" aria-label="تصفية حسب التصنيف">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
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
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-navy/50 py-20 font-ui" role="status">
          لا توجد مقالات مطابقة لبحثك — جرّبي كلمة أخرى.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((article, i) => (
            <RevealOnScroll key={article.slug} delay={(i % 3) * 0.08} className="h-full">
              <ArticleCard article={article} />
            </RevealOnScroll>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-14" aria-label="صفحات المقالات">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => setPage(p)}
              className={cn(
                "h-10 w-10 rounded-full font-ui text-sm transition-colors",
                p === page ? "bg-gold text-navy" : "bg-section text-navy/60 hover:bg-navy/10"
              )}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
