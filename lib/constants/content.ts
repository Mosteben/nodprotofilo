import type {
  Lecture,
  Stat,
} from "@/types";

export const STATS: Stat[] = [
  { label: "مقالة منشورة", value: 42 },
  { label: "محاضرة تعليمية", value: 26 },
  { label: "طالب وقارئ", value: 3200, suffix: "+" },
  { label: "مصدر تعليمي مجاني", value: 58 },
];

// Articles now live in Supabase (see supabase/import_existing_content.sql).

export const LECTURES: Lecture[] = [
  {
    slug: "tariqat-al-biruni-eratosthenes-qismah-mutawwalah",
    title: "طرق البيروني وإيراتوستينس لقياس محيط الأرض والقسمة المطولة",
    description:
      "شرح للطريقتين التاريخيتين اللي استخدمهم البيروني وإيراتوستينس لقياس محيط الأرض، مع تطبيق عملي على القسمة المطولة.",
    youtubeId: "7u3k-E7tB-s",
    thumbnail: "https://images.unsplash.com/photo-1604549944235-3e5579b15cc2?q=80&w=1200&auto=format&fit=crop",
    duration: "00:00", // TODO: حطي المدة الفعلية من الفيديو على يوتيوب
    category: "تاريخ العلوم",
    publishedAt: "2026-07-01",
  },
  {
    slug: "al-judhur-al-summa-fak-al-aqwas-cardano",
    title: "طريقة الجذور الصماء، فك الأقواس، وطريقة كاردانو",
    description:
      "شرح طريقة التعامل مع الجذور الصماء وفك الأقواس، بالإضافة لطريقة كاردانو الشهيرة في حل المعادلات.",
    youtubeId: "p8MgDNli_eU",
    thumbnail: "https://images.unsplash.com/photo-1758685734303-e85757067f28?q=80&w=1200&auto=format&fit=crop",
    duration: "00:00", // TODO
    category: "جبر",
    publishedAt: "2026-07-08",
  },
  {
    slug: "tariqat-ferrari-muadala-min-al-daraja-al-rabia",
    title: "طريقة فيراري لحل معادلة من الدرجة الرابعة",
    description: "شرح تفصيلي لطريقة فيراري الكلاسيكية في حل المعادلات من الدرجة الرابعة خطوة بخطوة.",
    youtubeId: "-QHutrljjE4",
    thumbnail: "https://images.unsplash.com/photo-1758685848791-87860bb29292?q=80&w=1200&auto=format&fit=crop",
    duration: "00:00", // TODO
    category: "جبر",
    publishedAt: "2026-07-15",
  },
];
