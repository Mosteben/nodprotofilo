import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_PAGE_SIZE = 20;

/** Parses ?page= into a 1-based page number and the matching Supabase range. */
export function pageRange(pageParam: string | undefined, pageSize = ADMIN_PAGE_SIZE) {
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * pageSize;
  return { page, from, to: from + pageSize - 1 };
}

export function Pagination({
  basePath,
  params,
  page,
  total,
  pageSize = ADMIN_PAGE_SIZE,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  total: number;
  pageSize?: number;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `${basePath}${s ? `?${s}` : ""}` as Route;
  };

  const linkClass = "h-10 min-w-10 px-3 rounded-full font-ui text-sm flex items-center justify-center transition-colors";

  return (
    <nav aria-label="التنقل بين الصفحات" className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(linkClass, "bg-paper text-navy hover:bg-navy/10")} aria-label="الصفحة السابقة">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
      <span className="font-ui text-sm text-navy/60 px-2">
        صفحة {page} من {pages}
      </span>
      {page < pages && (
        <Link href={href(page + 1)} className={cn(linkClass, "bg-paper text-navy hover:bg-navy/10")} aria-label="الصفحة التالية">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}

