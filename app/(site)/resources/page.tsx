import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResourcesExplorer } from "@/components/resources/ResourcesExplorer";
import { getPublishedResources } from "@/lib/data/collections";

export const revalidate = 3600;

const description = "ملخصات، أوراق عمل، وعروض تقديمية تعليمية مجانية للتحميل.";

export const metadata: Metadata = {
  title: "الموارد التعليمية",
  description,
  alternates: { canonical: "/resources" },
  openGraph: { title: "الموارد التعليمية", description },
};

export default async function ResourcesPage() {
  const resources = await getPublishedResources();

  return (
    <>
      <PageHeader
        eyebrow="مكتبة الموارد"
        title="الموارد التعليمية"
        description="ملفات مجانية أعددتها لتسهيل المذاكرة والمراجعة — ملخصات، أوراق عمل، وعروض تقديمية."
      />
      <section className="section-py">
        <div className="container">
          {resources.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد موارد منشورة بعد — عودي قريبًا.</p>
          ) : (
            <ResourcesExplorer resources={resources} />
          )}
        </div>
      </section>
    </>
  );
}
