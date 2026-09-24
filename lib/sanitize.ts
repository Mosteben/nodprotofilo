import sanitizeHtml from "sanitize-html";

/**
 * Allow-list for rich text produced by the Tiptap editor. Everything else (scripts, event
 * handlers, iframes, inline styles, javascript: URLs, …) is removed.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s",
    "a",
    "ul", "ol", "li",
    "blockquote",
    "pre", "code",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    code: ["class"],
  },
  allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" },
    }),
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  // Keep only http(s) and site-relative ("/images/…") sources; drop data:, "//host" and bare paths.
  exclusiveFilter: (frame) => frame.tag === "img" && !/^(https?:\/\/|\/(?!\/))/i.test(frame.attribs.src ?? ""),
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
