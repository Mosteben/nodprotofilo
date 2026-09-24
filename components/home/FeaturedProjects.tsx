import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFeaturedProjects } from "@/lib/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects(3);
  if (projects.length === 0) return null;

  return (
    <section className="section-py bg-section">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="من أعمالي" title="مشاريع مختارة" description="نماذج من أعمال أعتز بها." />
          <Link href="/portfolio" className="link-underline font-ui text-navy font-medium flex items-center gap-2 mb-12">
            كل الأعمال
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <RevealOnScroll key={project.slug} delay={i * 0.1} className="h-full">
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
