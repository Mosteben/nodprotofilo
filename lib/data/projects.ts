import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { sanitizeRichText } from "@/lib/sanitize";
import type { ProjectRow } from "@/types/database";

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  client: string | null;
  year: number | null;
  projectUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & { contentHtml: string };

const cacheOptions = { tags: [CACHE_TAGS.projects], revalidate: PUBLIC_REVALIDATE_SECONDS };

function toSummary(row: ProjectRow): ProjectSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.cover_image_url,
    category: row.category,
    client: row.client,
    year: row.year,
    projectUrl: row.project_url,
    githubUrl: row.github_url,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

const fetchPublishedProjects = unstable_cache(
  async (): Promise<ProjectSummary[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("year", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(`projects: ${error.message}`);
    return data.map(toSummary);
  },
  ["published-projects"],
  cacheOptions
);

/** Published projects (featured first). Returns [] if the database is unreachable. */
export async function getPublishedProjects(): Promise<ProjectSummary[]> {
  try {
    return await fetchPublishedProjects();
  } catch (error) {
    console.error("[data] failed to load projects", error);
    return [];
  }
}

export async function getFeaturedProjects(limit = 3): Promise<ProjectSummary[]> {
  return (await getPublishedProjects()).filter((p) => p.featured).slice(0, limit);
}

/** One published project by slug, or null. Throws if the database is unreachable. */
export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`project: ${error.message}`);
    if (!data) return null;
    return { ...toSummary(data), contentHtml: sanitizeRichText(data.content) };
  },
  ["project-by-slug"],
  cacheOptions
);
