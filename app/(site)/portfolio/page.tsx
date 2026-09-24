import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import { getPublishedProjects } from "@/lib/data/projects";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "أعمالي",
  description: "مشاريع وأعمال مختارة في الكتابة والمحتوى التعليمي.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHeader eyebrow="معرض الأعمال" title="أعمالي" description="مشاريع مختارة اشتغلت عليها — من الفكرة إلى النتيجة." />
      <section className="section-py">
        <div className="container">
          {projects.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد مشاريع منشورة بعد — عودي قريبًا.</p>
          ) : (
            <PortfolioExplorer projects={projects} />
          )}
        </div>
      </section>
    </>
  );
}
