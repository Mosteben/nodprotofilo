"use client";

import { useMemo, useState } from "react";
import { Search, FileText, FileSpreadsheet, Presentation, FileImage, File, Download, ExternalLink } from "lucide-react";
import type { ResourceRow } from "@/types/database";
import { resourceTypeLabel } from "@/lib/resource-files";
import { cn, formatFileSize } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const ALL = "الكل";

function iconFor(mime: string | null) {
  if (!mime) return File;
  if (mime === "application/pdf" || mime.includes("wordprocessing")) return FileText;
  if (mime.includes("presentation")) return Presentation;
  if (mime.includes("spreadsheet")) return FileSpreadsheet;
  if (mime.startsWith("image/")) return FileImage;
  return File;
}

export function ResourcesExplorer({ resources }: { resources: ResourceRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(resources.map((r) => r.category).filter((c): c is string => Boolean(c))))],
    [resources]
  );

  const q = query.trim();
  const filtered = resources.filter((r) => {
    const matchesQuery = !q || r.title.includes(q) || (r.description ?? "").includes(q) || (r.author ?? "").includes(q);
    return matchesQuery && (category === ALL || r.category === category);
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <label htmlFor="resource-search" className="sr-only">
            ابحثي في الموارد
          </label>
          <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
          <input
            id="resource-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن ملف أو موضوع..."
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
                onClick={() => setCategory(c)}
                className={cn(
                  "h-12 px-5 rounded-full font-ui text-sm border transition-colors",
                  category === c ? "bg-navy text-white border-navy" : "border-navy/10 text-navy/70 hover:border-gold"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-navy/50 py-20 font-ui" role="status">
          لا توجد ملفات مطابقة.
        </p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-5">
          {filtered.map((res, i) => {
            const Icon = iconFor(res.mime_type);
            const href = res.file_url ?? res.external_url;
            const isFile = Boolean(res.file_url);
            const meta = [isFile ? resourceTypeLabel(res.mime_type) : "رابط خارجي", res.file_size ? formatFileSize(res.file_size) : null, res.author]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={res.id}>
                <RevealOnScroll delay={(i % 4) * 0.06} className="flex items-center gap-4 rounded-2xl border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all p-5 h-full">
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-section flex items-center justify-center text-gold-dark overflow-hidden">
                    {res.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail from any host
                      <img src={res.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-navy">{res.title}</h3>
                    {res.description && <p className="text-brown/70 text-sm line-clamp-2">{res.description}</p>}
                    <span className="text-xs text-navy/40 font-ui">{meta}</span>
                  </div>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${isFile ? "تحميل" : "فتح"} ${res.title}`}
                      title={isFile ? "تحميل / عرض" : "فتح الرابط"}
                      className="h-10 w-10 shrink-0 rounded-full bg-gold/10 hover:bg-gold hover:text-navy flex items-center justify-center text-gold-dark transition-colors"
                    >
                      {isFile ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                    </a>
                  )}
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
