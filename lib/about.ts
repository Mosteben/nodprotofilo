import { z } from "zod";

/** Icons the owner can pick for About highlight cards (mapped to lucide icons in the UI). */
export const ABOUT_ICONS = {
  graduation: "تعليم",
  pen: "كتابة",
  target: "هدف",
  sparkles: "اهتمامات",
  book: "كتاب",
  heart: "شغف",
  briefcase: "عمل",
  star: "إنجاز",
} as const;

export type AboutIcon = keyof typeof ABOUT_ICONS;
const ICON_KEYS = Object.keys(ABOUT_ICONS) as [AboutIcon, ...AboutIcon[]];

const str = (max: number) => z.string().max(max).catch("");
/** A list that falls back to `fallback` only when the stored value is missing/invalid. */
const list = <T extends z.ZodType>(item: T, fallback: z.output<T>[]) => z.array(item).max(40).catch(fallback);

const DEFAULT_HIGHLIGHTS = [
  {
    icon: "graduation" as const,
    title: "التعليم",
    text: "طالبة بكلية التربية، قسم العلوم، جامعة طنطا. أدرس أسس تدريس العلوم وطرق إيصال المفاهيم العلمية للطلاب بمراحلهم المختلفة.",
  },
  {
    icon: "pen" as const,
    title: "رحلة الكتابة",
    text: "بدأت الكتابة كوسيلة لتنظيم أفكاري أثناء المذاكرة، ثم تحوّلت إلى شغف أشارك من خلاله تجربتي مع كل طالب يبحث عن طريقة أسهل للفهم.",
  },
  {
    icon: "target" as const,
    title: "رسالتي التعليمية",
    text: "أن أجعل مادة العلوم صديقة لا عبئًا، من خلال محتوى مبسّط ومقالات ومحاضرات تراعي اختلاف أساليب التعلّم بين الطلاب.",
  },
  {
    icon: "sparkles" as const,
    title: "اهتماماتي",
    text: "القراءة، الكتابة الإبداعية، تصميم المحتوى التعليمي، ومتابعة كل جديد في طرق التدريس الحديثة.",
  },
];

const DEFAULT_SKILLS = [
  { label: "الكتابة العلمية المبسّطة", level: 90 },
  { label: "تصميم محتوى تعليمي", level: 80 },
  { label: "التواصل والشرح", level: 85 },
  { label: "البحث والتحضير الأكاديمي", level: 75 },
];

const DEFAULT_TIMELINE = [
  { year: "٢٠٢٢", title: "بداية الرحلة الجامعية", description: "التحقت بكلية التربية قسم العلوم بجامعة طنطا، وبدأت اكتشاف شغفي بالتدريس." },
  { year: "٢٠٢٣", title: "أول مقال منشور", description: "بدأت الكتابة عن تجربتي كطالبة علوم، ووجدت في الكتابة وسيلة لتنظيم أفكاري." },
  { year: "٢٠٢٤", title: "أول محاضرة مسجّلة", description: "سجّلت أول فيديو تعليمي مبسّط لمشاركة طريقتي في المذاكرة مع طلاب آخرين." },
  { year: "٢٠٢٥", title: "إطلاق مساحتي التعليمية", description: "جمعت المقالات والمحاضرات والموارد في مكان واحد ليستفيد منها أكبر عدد ممكن." },
];

const titled = z.object({ title: str(160), description: str(1000) });

/** site_settings.about (JSONB). Invalid or missing parts fall back to the original About page. */
export const aboutSchema = z.object({
  imageUrl: str(2000),
  longBio: str(50000), // editor HTML (legacy values may be plain text)
  highlights: list(z.object({ icon: z.enum(ICON_KEYS).catch("sparkles"), title: str(120), text: str(1000) }), DEFAULT_HIGHLIGHTS),
  skills: list(z.object({ label: str(120), level: z.number().int().min(0).max(100).catch(50) }), DEFAULT_SKILLS),
  timeline: list(z.object({ year: str(40), title: str(160), description: str(1000) }), DEFAULT_TIMELINE),
  education: list(z.object({ period: str(60), title: str(160), description: str(1000) }), []),
  achievements: list(titled, []),
  services: list(titled, []),
});

export type AboutContent = z.output<typeof aboutSchema>;

export const DEFAULT_ABOUT_IMAGE = "/images/profile/profile.jpeg";

/** Parses stored About content; `legacyImage` is the image previously kept in the homepage settings. */
export function parseAbout(value: unknown, legacyImage?: unknown): AboutContent {
  const about = aboutSchema.parse(value && typeof value === "object" ? value : {});
  if (!about.imageUrl) about.imageUrl = typeof legacyImage === "string" && legacyImage ? legacyImage : DEFAULT_ABOUT_IMAGE;
  return about;
}
