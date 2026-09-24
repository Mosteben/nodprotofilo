import type {
  Lecture,
  Book,
  Resource,
  GalleryImage,
  TimelineItem,
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
// ==========================================================================
// الكتب - استبدلتها بروايات حنان لاشين ومني سلامة (الكاتبتين المفضلتين)
// + رواية ماجدولين. العناوين دي حقيقية وتأكدت منها بالبحث، لكن:
//   - price و pages حطيتلهم قيم تقريبية فقط (TODO) لإني معنديش أرقام مؤكدة
//     من الناشر، لازم تراجعيها من الغلاف الخلفي أو موقع الناشر.
//   - cover: مسار محلي مرقّم زي مقالاتك، حمّلي صورة الغلاف الحقيقية
//     (من موقع الناشر "عصير الكتب" أو من الكتاب نفسه) وحطيها في المسار ده:
//       public/images/books/{slug}/1.jpg
// ==========================================================================
export const BOOKS: Book[] = [
  // ---------- روايات حنان لاشين ----------
  {
    slug: "ghazl-al-banat-hanan-lashin",
    title: "غزل البنات — حنان لاشين",
    description:
      "من أشهر روايات حنان لاشين الاجتماعية، تتناول قصة حب وزواج بأسلوب رقيق يمزج الرومانسية بالقيم الأسرية.",
    cover: "/images/books/ghazl-al-banat-hanan-lashin/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO: حطي عدد الصفحات الفعلي
    featured: true,
  },
  {
    slug: "ikadoli-hanan-lashin",
    title: "إيكادولي — حنان لاشين",
    description:
      "الجزء الأول من سلسلة \"مملكة البلاغة\" الفانتازية، حيث تستدعي الكتب الحية محاربين من عالم القراء لمواجهة الشر.",
    cover: "/images/books/ikadoli-hanan-lashin/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO
  },
  {
    slug: "al-hala-al-muqaddasa-hanan-lashin",
    title: "الهالة المقدسة — حنان لاشين",
    description: "رواية اجتماعية من أعمال حنان لاشين، تحمل طابعها المعتاد في مزج القيم الإنسانية والدينية بالسرد الروائي.",
    cover: "/images/books/al-hala-al-muqaddasa-hanan-lashin/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO
  },

  // ---------- روايات مني سلامة ----------
  {
    slug: "kighar-mona-salama",
    title: "كيغار — مني سلامة",
    description:
      "أول الأعمال المطبوعة لمني سلامة (2015)، رواية رومانسية اجتماعية تتناول الظلم الإنساني في المناطق العشوائية.",
    cover: "/images/books/kighar-mona-salama/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO
    featured: true,
  },
  {
    slug: "min-waraa-hijab-mona-salama",
    title: "من وراء حجاب — مني سلامة",
    description: "من أشهر وأنجح روايات مني سلامة، تمزج بين الرومانسية والفانتازيا والواقعية السحرية.",
    cover: "/images/books/min-waraa-hijab-mona-salama/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO
  },
  {
    slug: "thani-oksid-al-hub-mona-salama",
    title: "ثاني أكسيد الحب — مني سلامة",
    description: "رواية رومانسية اجتماعية لمني سلامة، صدرت في معرض القاهرة الدولي للكتاب 2018 عن دار عصير الكتب.",
    cover: "/images/books/thani-oksid-al-hub-mona-salama/1.jpg",
    price: "TODO: راجعي السعر من دار عصير الكتب",
    pages: 0, // TODO
  },

  // ---------- رواية ماجدولين ----------
  {
    slug: "majdouline",
    title: "ماجدولين (تحت ظلال الزيزفون)",
    description:
      "الرواية الرومانسية الكلاسيكية التي عرّبها مصطفى لطفي المنفلوطي عن أصل فرنسي، وأصبحت من أشهر أعمدة الأدب العاطفي العربي. " +
      "(ملاحظة نادين: اه منك يا ماجدولين يا قرعة هتعنسي عشان راجل ياعنيا الواد ستيفن دا مش متربي 😂)",
    cover: "/images/books/majdouline/1.jpg",
    price: "TODO: راجعي السعر (متوفرة بطبعات كتير، أسعارها مختلفة)",
    pages: 0, // TODO
  },
];

export const RESOURCES: Resource[] = [
  {
    slug: "mulakhas-al-fasl-al-thani",
    title: "ملخص الفصل الثاني – العلوم الإعدادية",
    description: "ملخص مبسّط بالرسومات التوضيحية لأهم دروس الفصل الدراسي الثاني.",
    fileType: "pdf",
    fileUrl: "#",
    category: "ملخصات",
    sizeLabel: "٢٫٤ MB",
  },
  {
    slug: "worksheet-al-khalaya",
    title: "ورقة عمل: الخلية ووظائفها",
    description: "ورقة عمل تفاعلية مع أسئلة تدريبية للمراجعة الذاتية.",
    fileType: "worksheet",
    fileUrl: "#",
    category: "أوراق عمل",
    sizeLabel: "٨٠٠ KB",
  },
  {
    slug: "presentation-al-taghziya",
    title: "عرض تقديمي: أساسيات التغذية السليمة",
    description: "عرض بوربوينت جاهز للاستخدام في الحصص الدراسية أو المراجعة الذاتية.",
    fileType: "pptx",
    fileUrl: "#",
    category: "عروض تقديمية",
    sizeLabel: "٥٫١ MB",
  },
];

export const GALLERY: GalleryImage[] = [
  // ... العناصر الموجودة من قبل (g1 → g6) تفضل زي ما هي

  { id: "g7", src: "/images/gallery/g7-historic-building.png", alt: "واجهة مبنى تاريخي بطراز معماري مميز تحت سماء صافية", category: "لحظات يومية" },
  { id: "g8", src: "/images/gallery/g8-sky-branches.png", alt: "السماء الزرقاء من بين أغصان الأشجار", category: "لحظات يومية" },
  { id: "g9", src: "/images/gallery/g9-sky-city.png", alt: "سماء صافية بغيوم متناثرة فوق أسطح المدينة ونخلة", category: "لحظات يومية" },
  { id: "g10", src: "/images/gallery/g10-green-field.png", alt: "حقل أخضر وسط المدينة تحت أشعة الشمس", category: "لحظات يومية" },
  { id: "g11", src: "/images/gallery/g11-sunset-clouds.png", alt: "غيوم الغروب الدرامية فوق أسطح المدينة", category: "لحظات يومية" },
  { id: "g12", src: "/images/gallery/g12-pine-tree.png", alt: "شجرة سرو شامخة تحت سماء زرقاء صافية", category: "لحظات يومية" },
  { id: "g13", src: "/images/gallery/g13-flower.png", alt: "زهرة برتقالية زاهية وسط أوراق خضراء", category: "لحظات يومية" },
  { id: "g14", src: "/images/gallery/g14-beach.png", alt: "شاطئ بمياه فيروزية صافية من شرفة مطلة على البحر", category: "لحظات يومية" },
];

export const TIMELINE: TimelineItem[] = [
  { year: "٢٠٢٢", title: "بداية الرحلة الجامعية", description: "التحقت بكلية التربية قسم العلوم بجامعة طنطا، وبدأت اكتشاف شغفي بالتدريس." },
  { year: "٢٠٢٣", title: "أول مقال منشور", description: "بدأت الكتابة عن تجربتي كطالبة علوم، ووجدت في الكتابة وسيلة لتنظيم أفكاري." },
  { year: "٢٠٢٤", title: "أول محاضرة مسجّلة", description: "سجّلت أول فيديو تعليمي مبسّط لمشاركة طريقتي في المذاكرة مع طلاب آخرين." },
  { year: "٢٠٢٥", title: "إطلاق مساحتي التعليمية", description: "جمعت المقالات والمحاضرات والموارد في مكان واحد ليستفيد منها أكبر عدد ممكن." },
];