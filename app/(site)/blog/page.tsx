import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticlesExplorer } from "@/components/articles/ArticlesExplorer";
import { getPublishedArticles } from "@/lib/data/articles";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات ونصوص حول تعليم العلوم، الكتابة، والحياة الجامعية.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <PageHeader
        eyebrow="المدونة"
        title="المقالات"
        description="كتابات حول تعليم العلوم، الكتابة، والحياة الجامعية — بصوتي الخاص."
      />
      <section className="section-py">
        <div className="container">
          {articles.length === 0 ? (
            <p className="text-center text-navy/50 py-20 font-ui">لا توجد مقالات منشورة بعد — عودي قريبًا.</p>
          ) : (
            <ArticlesExplorer articles={articles} />
          )}
        </div>
      </section>
    </>
  );
}
