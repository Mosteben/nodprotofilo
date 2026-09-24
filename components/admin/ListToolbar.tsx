"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Select } from "@/components/ui/form";

export type ToolbarFilter = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * Search box + select filters that live in the URL query string, so lists are
 * server-rendered, shareable and survive a refresh.
 */
export function ListToolbar({
  searchPlaceholder,
  filters = [],
}: {
  searchPlaceholder: string;
  filters?: ToolbarFilter[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}` as Route, { scroll: false }));
  }

  // Debounce typing in the search box.
  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => update({ q: query.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query]);

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <label htmlFor="list-search" className="sr-only">
          بحث
        </label>
        <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-navy/40" />
        <input
          id="list-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-12 rounded-xl bg-paper pe-11 ps-11 outline-none border border-navy/10 focus-visible:border-gold font-ui text-sm"
        />
        {pending && (
          <Loader2 className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 animate-spin text-navy/40" aria-label="جارٍ التحديث" />
        )}
      </div>
      {filters.map((filter) => (
        <div key={filter.name} className="md:w-48">
          <label htmlFor={`filter-${filter.name}`} className="sr-only">
            {filter.label}
          </label>
          <Select
            id={`filter-${filter.name}`}
            value={params.get(filter.name) ?? ""}
            onChange={(e) => update({ [filter.name]: e.target.value })}
            className="bg-paper font-ui text-sm"
          >
            {filter.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}
