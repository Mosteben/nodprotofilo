import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResourcesExplorer } from "@/components/resources/ResourcesExplorer";
import { RESOURCES } from "@/lib/constants/content";

export const metadata: Metadata = {
  title: "الموارد التعليمية",
  description: "ملخصات، أوراق عمل، وعروض تقديمية تعليمية مجانية للتحميل.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="مكتبة الموارد"
        title="الموارد التعليمية"
        description="ملفات مجانية أعددتها لتسهيل المذاكرة والمراجعة — ملخصات، أوراق عمل، وعروض تقديمية."
      />
      <section className="section-py">
        <div className="container">
          <ResourcesExplorer resources={RESOURCES} />
        </div>
      </section>
    </>
  );
}
