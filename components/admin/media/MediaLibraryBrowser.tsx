"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MediaRow } from "@/types/database";
import { orIlikeFilter } from "@/lib/utils";

/** Searchable grid of uploaded images; clicking one selects it. */
export function MediaLibraryBrowser({ onPick }: { onPick: (media: MediaRow) => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaRow[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setState("loading");
      let request = createClient().from("media").select("*").order("created_at", { ascending: false }).limit(60);
      if (query.trim()) request = request.or(orIlikeFilter(["file_name", "alt_text"], query));
      const { data, error } = await request;
      if (cancelled) return;
      if (error) return setState("error");
      setItems(data);
      setState("ready");
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div>
      <div className="relative mb-4">
        <label htmlFor="library-search" className="sr-only">
          بحث في المكتبة
        </label>
        <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحثي باسم الملف أو الوصف..."
          className="w-full h-11 rounded-xl bg-section pe-11 ps-4 outline-none border border-navy/10 focus-visible:border-gold font-ui text-sm"
        />
      </div>

      {state === "loading" && (
        <div className="py-16 flex justify-center" role="status" aria-label="جارٍ التحميل">
          <Loader2 className="h-6 w-6 animate-spin text-navy/40" />
        </div>
      )}
      {state === "error" && (
        <p role="alert" className="py-12 text-center font-ui text-sm text-red-600">
          تعذّر تحميل المكتبة. تحققي من الاتصال وحاولي مرة أخرى.
        </p>
      )}
      {state === "ready" && items.length === 0 && (
        <p className="py-12 text-center font-ui text-sm text-navy/50">
          {query ? "لا توجد نتائج." : "لا توجد صور بعد — ارفعي صورة من تبويب «رفع»."}
        </p>
      )}
      {state === "ready" && items.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="block w-full aspect-square rounded-xl overflow-hidden bg-section ring-offset-2 hover:ring-2 hover:ring-gold focus-visible:ring-2 focus-visible:ring-gold outline-none"
                title={item.alt_text ?? item.file_name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails */}
                <img src={item.file_url} alt={item.alt_text ?? item.file_name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
