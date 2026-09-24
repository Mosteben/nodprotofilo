import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { GALLERY } from "@/lib/constants/content";

export const metadata: Metadata = {
  title: "معرض الصور",
  description: "لقطات من رحلة الكتابة والتصوير والمحاضرات.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="لحظات"
        title="معرض الصور"
        description="مجموعة من اللقطات التي توثّق رحلتي."
      />
      <section className="section-py">
        <div className="container">
          <MasonryGallery images={GALLERY} />
        </div>
      </section>
    </>
  );
}
