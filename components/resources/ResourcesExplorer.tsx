"use client";

import { useMemo, useState } from "react";
import { Search, FileText, FileSpreadsheet, ClipboardList, File, Download } from "lucide-react";
import type { Resource } from "@/types";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const ICONS: Record<Resource["fileType"], typeof FileText> = {
  pdf: FileText,
  pptx: FileSpreadsheet,
  worksheet: ClipboardList,
  docx: File,
};

export function ResourcesExplorer({ resources }: { resources: Resource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");

  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(resources.map((r) => r.category)))],
    [resources]
  );

  const filtered = resources.filter((r) => {
    const matchesQuery = r.title.includes(query) || r.description.includes(query);
    const matchesCategory = category === "الكل" || r.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن ملف أو موضوع..."
            className="w-full h-12 rounded-full bg-section pe-12 ps-5 outline-none border border-navy/10 focus-visible:border-gold"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
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
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-navy/50 py-20 font-ui">لا توجد ملفات مطابقة.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((res, i) => {
            const Icon = ICONS[res.fileType];
            return (
              <RevealOnScroll key={res.slug} delay={(i % 4) * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all p-5">
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-section flex items-center justify-center text-gold-dark">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-navy truncate">{res.title}</h3>
                    <p className="text-brown/70 text-sm line-clamp-1">{res.description}</p>
                    <span className="text-xs text-navy/40 font-ui">{res.sizeLabel}</span>
                  </div>
                  <a
                    href={res.fileUrl}
                    aria-label={`تحميل ${res.title}`}
                    className="h-10 w-10 shrink-0 rounded-full bg-gold/10 hover:bg-gold hover:text-navy flex items-center justify-center text-gold-dark transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      )}
    </div>
  );
}
