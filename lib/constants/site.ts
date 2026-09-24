/** Canonical site URL: explicit env var, then Vercel's production domain, then localhost. */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE = {
  name: "نادين محمد",
  role: "طالبة بكلية التربية – قسم العلوم – جامعة طنطا",
  tagline: "أكتب عن العلوم والتعليم بطريقة أبسط وأقرب",
  description:
    "مساحة نادين محمد الشخصية — طالبة علوم تربوية وكاتبة، تشارك مقالات ومحاضرات وموارد تعليمية بأسلوب مبسّط ومحبب.",
  url: siteUrl(),
  locale: "ar_EG",
  facebook: "https://www.facebook.com/nadeen.mohamed.945511",
  youtube: "https://www.youtube.com/@andy_77-n7n",
  email: "hello@nadeen-mohamed.example.com",
  whatsapp: "https://wa.me/201144201456",
};

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من أنا" },
  { href: "/portfolio", label: "أعمالي" },
  { href: "/blog", label: "المدونة" },
  { href: "/gallery", label: "معرض الصور" },
  { href: "/resources", label: "الموارد" },
  { href: "/books", label: "الكتب" },
  { href: "/lectures", label: "المحاضرات" },
  { href: "/contact", label: "تواصل معي" },
] as const;
