import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { getPublishedGallery } from "@/lib/data/collections";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "معرض الصور",
  description: "لقطات من رحلة الكتابة والتصوير والمحاضرات.",
  alternates: { canonical: "/gallery" },
  openGraph: { title: "معرض الصور", description: "لقطات من رحلة الكتابة والتصوير والمحاضرات." },
};

export default async function GalleryPage() {
  const items = await getPublishedGallery();
  const images = items.map((i) => ({
    id: i.id,
    src: i.image_url,
    alt: i.alt_text || i.title || "صورة من المعرض",
    title: i.title,
    caption: i.caption,
    category: i.category,
  }));

  return (
    <>
      <PageHeader eyebrow="لحظات" title="معرض الصور" description="مجموعة من اللقطات التي توثّق رحلتي." />
      <section className="section-py">
        <div className="container">
          {images.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد صور منشورة بعد — عودي قريبًا.</p>
          ) : (
            <MasonryGallery images={images} />
          )}
        </div>
      </section>
    </>
  );
}
