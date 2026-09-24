/**
 * Declarative definitions of the simple CMS collections (gallery, resources, books,
 * lectures). The admin list/form pages and the server actions are driven by these, so
 * each section is described once. Safe to import from client components.
 */

export type FieldDef =
  | {
      name: string;
      label: string;
      type: "text" | "textarea" | "url" | "number" | "date";
      required?: boolean;
      hint?: string;
      maxLength?: number;
      ltr?: boolean;
      placeholder?: string;
      suggest?: boolean; // offer existing values (e.g. categories) as suggestions
    }
  | { name: string; label: string; type: "image"; required?: boolean; hint?: string; aspect?: string }
  | { name: string; label: string; type: "slug"; prefix: string }
  | { name: string; label: string; type: "youtube"; hint?: string }
  /** Upload to the resources bucket; `mode: "record"` also keeps path/name/type/size. */
  | { name: string; label: string; type: "file"; mode: "record" | "url"; hint?: string }
  | { name: string; label: string; type: "checkbox"; description?: string };

export type CollectionKey = "gallery" | "resources" | "books" | "lectures";

export type CollectionDef = {
  table: "gallery_items" | "resources" | "books" | "lectures";
  title: string;
  description: string;
  itemLabel: string;
  newLabel: string;
  /** Column shown as the item's name in lists. */
  nameField: string;
  imageField: string;
  hasFeatured: boolean;
  hasSlug: boolean;
  searchColumns: string[];
  /** Public URL of an item, or of the section. */
  publicPath: (item: Record<string, unknown>) => string;
  /** Main column (content) and side column (publishing, media, metadata). */
  main: FieldDef[];
  side: FieldDef[];
};

const published: FieldDef = { name: "published", label: "منشور", type: "checkbox", description: "يظهر للزوار في الموقع." };
const featured: FieldDef = { name: "featured", label: "مميّز", type: "checkbox", description: "يظهر في الصفحة الرئيسية." };
const category: FieldDef = { name: "category", label: "التصنيف", type: "text", maxLength: 60, suggest: true };

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  gallery: {
    table: "gallery_items",
    title: "معرض الصور",
    description: "الصور المعروضة في صفحة المعرض. رتّبيها بالأسهم وأخفي ما لا تريدين عرضه.",
    itemLabel: "صورة",
    newLabel: "إضافة صورة",
    nameField: "title",
    imageField: "image_url",
    hasFeatured: false,
    hasSlug: false,
    searchColumns: ["title", "caption", "alt_text", "category"],
    publicPath: () => "/gallery",
    main: [
      { name: "image_url", label: "الصورة", type: "image", required: true, aspect: "aspect-[4/3]" },
      { name: "title", label: "العنوان", type: "text", maxLength: 200 },
      { name: "caption", label: "الوصف / التعليق", type: "textarea", maxLength: 1000 },
    ],
    side: [
      published,
      { name: "alt_text", label: "النص البديل", type: "text", maxLength: 300, hint: "وصف قصير للصورة لقارئات الشاشة ومحركات البحث." },
      category,
    ],
  },

  resources: {
    table: "resources",
    title: "الموارد التعليمية",
    description: "ملفات للتحميل (PDF، مستندات، صور) أو روابط خارجية.",
    itemLabel: "مورد",
    newLabel: "مورد جديد",
    nameField: "title",
    imageField: "thumbnail_url",
    hasFeatured: false,
    hasSlug: false,
    searchColumns: ["title", "description", "category", "author"],
    publicPath: () => "/resources",
    main: [
      { name: "title", label: "العنوان", type: "text", required: true, maxLength: 200 },
      { name: "description", label: "الوصف", type: "textarea", maxLength: 1000 },
      { name: "file", label: "الملف", type: "file", mode: "record", hint: "PDF أو Word أو PowerPoint أو Excel أو صورة — حتى 20 ميجابايت." },
      { name: "external_url", label: "أو رابط خارجي", type: "url", ltr: true, placeholder: "https://…", hint: "يُستخدم إذا لم يكن هناك ملف مرفوع." },
    ],
    side: [
      published,
      category,
      { name: "author", label: "المؤلف / المصدر", type: "text", maxLength: 120 },
      { name: "thumbnail_url", label: "صورة مصغّرة", type: "image", aspect: "aspect-[4/3]" },
    ],
  },

  books: {
    table: "books",
    title: "الكتب",
    description: "الكتب المعروضة في صفحة الكتب والصفحة الرئيسية.",
    itemLabel: "كتاب",
    newLabel: "كتاب جديد",
    nameField: "title",
    imageField: "cover_image_url",
    hasFeatured: true,
    hasSlug: true,
    searchColumns: ["title", "author", "category"],
    publicPath: (item) => `/books/${item.slug}`,
    main: [
      { name: "title", label: "العنوان", type: "text", required: true, maxLength: 200 },
      { name: "slug", label: "الرابط (slug)", type: "slug", prefix: "/books" },
      { name: "author", label: "المؤلف", type: "text", maxLength: 120 },
      { name: "description", label: "الوصف", type: "textarea", maxLength: 3000 },
      { name: "purchase_url", label: "رابط الشراء", type: "url", ltr: true, placeholder: "https://…" },
      { name: "sample_url", label: "فصل تجريبي / معاينة", type: "file", mode: "url", hint: "ارفعي ملفًا (PDF…) أو الصقي رابطًا." },
    ],
    side: [
      published,
      featured,
      { name: "cover_image_url", label: "صورة الغلاف", type: "image", aspect: "aspect-[3/4]" },
      category,
      { name: "publication_year", label: "سنة النشر", type: "number", ltr: true, placeholder: "2026" },
      { name: "pages", label: "عدد الصفحات", type: "number", ltr: true },
      { name: "price_label", label: "السعر / الحالة", type: "text", maxLength: 80, hint: "مثل: 150 جنيه، أو متوفر قريبًا." },
    ],
  },

  lectures: {
    title: "المحاضرات",
    table: "lectures",
    description: "فيديوهات يوتيوب أو روابط لمحاضرات خارجية.",
    itemLabel: "محاضرة",
    newLabel: "محاضرة جديدة",
    nameField: "title",
    imageField: "thumbnail_url",
    hasFeatured: true,
    hasSlug: true,
    searchColumns: ["title", "description", "speaker", "category"],
    publicPath: (item) => `/lectures/${item.slug}`,
    main: [
      { name: "title", label: "العنوان", type: "text", required: true, maxLength: 200 },
      { name: "slug", label: "الرابط (slug)", type: "slug", prefix: "/lectures" },
      { name: "youtube_id", label: "رابط يوتيوب", type: "youtube", hint: "الصقي أي رابط يوتيوب (watch أو youtu.be أو embed)." },
      { name: "external_url", label: "رابط خارجي للمحاضرة", type: "url", ltr: true, placeholder: "https://…", hint: "لمحاضرات خارج يوتيوب (Zoom، موقع جامعة…)." },
      { name: "description", label: "الوصف", type: "textarea", maxLength: 3000 },
    ],
    side: [
      published,
      featured,
      { name: "thumbnail_url", label: "الصورة المصغّرة", type: "image", aspect: "aspect-video", hint: "اختياري لفيديوهات يوتيوب — تُستخدم صورة الفيديو تلقائيًا." },
      category,
      { name: "speaker", label: "المحاضِر", type: "text", maxLength: 120 },
      { name: "lecture_date", label: "التاريخ", type: "date", ltr: true },
      { name: "duration", label: "المدة", type: "text", maxLength: 20, ltr: true, placeholder: "45:00" },
    ],
  },
};

export function isCollectionKey(value: string): value is CollectionKey {
  return value in COLLECTIONS;
}

/** Every column a collection's form edits (file fields expand to their stored columns). */
export function formColumns(def: CollectionDef): string[] {
  return [...def.main, ...def.side].flatMap((f) =>
    f.type === "file" && f.mode === "record" ? ["file_path", "file_url", "file_name", "mime_type", "file_size"] : [f.name]
  );
}
