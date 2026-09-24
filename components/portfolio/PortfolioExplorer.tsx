"use client";

import { useMemo, useState } from "react";
import type { ProjectSummary } from "@/lib/data/projects";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProjectCard } from "./ProjectCard";

const ALL = "الكل";

export function PortfolioExplorer({ projects }: { projects: ProjectSummary[] }) {
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c))))],
    [projects]
  );
  const visible = category === ALL ? projects : projects.filter((p) => p.category === category);

  return (
    <div>
      {categories.length > 2 && (
        <div className="flex gap-2 flex-wrap justify-center mb-12" role="group" aria-label="تصفية حسب التصنيف">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-11 px-5 rounded-full font-ui text-sm border transition-colors",
                category === c ? "bg-navy text-white border-navy" : "border-navy/10 text-navy/70 hover:border-gold"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visible.map((project, i) => (
          <RevealOnScroll key={project.slug} delay={(i % 3) * 0.08} className="h-full">
            <ProjectCard project={project} />
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
