import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticlesExplorer } from "@/components/articles/ArticlesExplorer";
import { ARTICLES } from "@/lib/constants/content";

export const metadata: Metadata = {
  title: "المقالات",
  description: "مقالات نادين محمد حول تعليم العلوم، الكتابة، وتجربتها الجامعية.",
};

export default function ArticlesPage() {
  return (
    <>
      <PageHeader
        eyebrow="المدونة"
        title="المقالات"
        description="كتابات حول تعليم العلوم، الكتابة، والحياة الجامعية — بصوتي الخاص."
      />
      <section className="section-py">
        <div className="container">
          <ArticlesExplorer articles={ARTICLES} />
        </div>
      </section>
    </>
  );
}
