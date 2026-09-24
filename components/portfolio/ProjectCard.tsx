import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProjectSummary } from "@/lib/data/projects";
import { CoverImage } from "@/components/shared/CoverImage";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const meta = [project.category, project.year].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500 h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <CoverImage
          src={project.coverImage}
          alt={project.title}
          className="transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        {meta && <span className="font-ui text-xs text-gold-dark mb-2">{meta}</span>}
        <h3 className="font-display text-xl text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-brown/80 text-sm leading-relaxed line-clamp-2 mb-4">{project.description}</p>
        )}
        <span className="mt-auto font-ui text-sm text-navy flex items-center gap-2">
          تفاصيل المشروع
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
