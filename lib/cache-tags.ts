/** Cache tags for public data. Admin mutations revalidate these so edits appear immediately. */
export const CACHE_TAGS = {
  articles: "articles",
  projects: "projects",
  settings: "settings",
  gallery: "gallery",
  resources: "resources",
  books: "books",
  lectures: "lectures",
  comments: "comments",
} as const;

/** Fallback revalidation window for public pages (seconds). */
export const PUBLIC_REVALIDATE_SECONDS = 3600;
