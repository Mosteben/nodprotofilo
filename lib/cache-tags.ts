/** Cache tags for public data. Admin mutations revalidate these so edits appear immediately. */
export const CACHE_TAGS = {
  articles: "articles",
  projects: "projects",
  settings: "settings",
} as const;

/** Fallback revalidation window for public pages (seconds). */
export const PUBLIC_REVALIDATE_SECONDS = 3600;
