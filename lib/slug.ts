/** Characters allowed in a slug by the database check constraint are "anything but / ? # % and whitespace". */
export const SLUG_PATTERN = /^[a-z0-9ء-ي٠-٩-]+$/;

/**
 * Builds a URL slug from a title. Keeps Latin letters, digits and Arabic letters, strips
 * Arabic diacritics/tatweel, and joins words with hyphens.
 *   "Hello World!" → "hello-world",  "أودّ الطيران" → "أود-الطيران"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // Latin accents
    .normalize("NFC") // recompose Arabic letters with hamza (أ إ ؤ ئ) before stripping marks
    .replace(/[ً-ٰٟـ]/g, "") // Arabic diacritics + tatweel
    .toLowerCase()
    .replace(/[^a-z0-9ء-ي٠-٩]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

/** Route params for non-ASCII slugs may arrive percent-encoded. */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
