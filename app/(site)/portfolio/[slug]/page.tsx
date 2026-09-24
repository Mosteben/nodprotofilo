import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Github, Calendar, Tag, User } from "lucide-react";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects";
import { decodeSlug } from "@/lib/slug";
import { SITE } from "@/lib/constants/site";
import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/shared/CoverImage";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { jsonLdScript } from "@/lib/json-ld";
import { Comments } from "@/components/comments/Comments";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(decodeSlug((await params).slug));
  if (!project) return { title: "مشروع غير موجود" };

  const url = `/portfolio/${project.slug}`;
  const description = project.description ?? `مشروع ${project.title}`;
  return {
    title: project.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: project.title,
      description,
      images: project.coverImage ? [{ url: project.coverImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: project.coverImage ? "summary_large_image" : "summary",
      title: project.title,
      description,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  const [project, all] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);
  if (!project) notFound();

  const more = all.filter((p) => p.slug !== project.slug).slice(0, 3);
  const facts = [
    { icon: Tag, label: "التصنيف", value: project.category },
    { icon: User, label: "العميل", value: project.client },
    { icon: Calendar, label: "السنة", value: project.year?.toString() },
  ].filter((f) => f.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description ?? undefined,
    image: project.coverImage ?? undefined,
    dateCreated: project.year?.toString(),
    creator: { "@type": "Person", name: SITE.name },
    url: `${SITE.url}/portfolio/${project.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <header className="bg-navy-fade text-white">
        <div className="container pt-8">
          <nav className="text-sm font-ui text-white/50" aria-label="مسار التصفح">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-gold">الرئيسية</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/portfolio" className="hover:text-gold">أعمالي</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/80 truncate max-w-[200px]" aria-current="page">{project.title}</li>
            </ol>
          </nav>
        </div>
        <div className="container-narrow text-center py-16 px-6">
          {project.category && <span className="marginalia text-gold-light mb-4 inline-block">— {project.category}</span>}
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">{project.title}</h1>
          {project.description && <p className="text-white/75 text-lg leading-relaxed">{project.description}</p>}
        </div>
      </header>

      {project.coverImage && (
        <div className="container -mt-2 pt-12">
          <div className="relative aspect-[16/9] max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-soft">
            <CoverImage src={project.coverImage} alt={project.title} priority sizes="(min-width: 1024px) 1024px, 100vw" />
          </div>
        </div>
      )}

      <div className="container section-py grid lg:grid-cols-[1fr_300px] gap-12 max-w-5xl">
        {/* Sanitised on save and again when read (lib/sanitize.ts). */}
        <div className="rich-content min-w-0" dangerouslySetInnerHTML={{ __html: project.contentHtml }} />

        {(facts.length > 0 || project.projectUrl || project.githubUrl) && (
          <aside className="lg:order-first">
            <div className="rounded-2xl bg-section p-6 space-y-5 lg:sticky lg:top-28">
              {facts.length > 0 && (
                <dl className="space-y-4 font-ui">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-navy/50">{label}</dt>
                        <dd className="text-navy font-medium">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}
              <div className="flex flex-col gap-3">
                {project.projectUrl && (
                  <Button href={project.projectUrl} size="sm" variant="gold">
                    <ExternalLink className="h-4 w-4" />
                    زيارة المشروع
                  </Button>
                )}
                {project.githubUrl && (
                  <Button href={project.githubUrl} size="sm" variant="outline">
                    <Github className="h-4 w-4" />
                    الكود على GitHub
                  </Button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      <Comments contentType="project" contentId={project.id} />

      {more.length > 0 && (
        <section className="section-py" aria-labelledby="more-projects">
          <div className="container">
            <h2 id="more-projects" className="font-display text-2xl text-navy mb-8">أعمال أخرى</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {more.map((p, i) => (
                <RevealOnScroll key={p.slug} delay={i * 0.08} className="h-full">
                  <ProjectCard project={p} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
