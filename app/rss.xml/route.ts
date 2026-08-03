import { SITE } from "@/lib/constants/site";
import { ARTICLES } from "@/lib/constants/content";

export async function GET() {
  const items = ARTICLES.map(
    (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${SITE.url}/articles/${a.slug}</link>
      <guid>${SITE.url}/articles/${a.slug}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${a.excerpt}]]></description>
    </item>`
  ).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>ar</language>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
