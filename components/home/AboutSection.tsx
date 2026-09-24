import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/shared/CoverImage";

export function AboutSection({ title, description, imageUrl }: { title: string; description: string; imageUrl: string }) {
  return (
    <section className="section-py">
      <div className="container grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
        <RevealOnScroll>
          <div className="relative aspect-square max-w-sm mx-auto">
            <div className="absolute inset-0 -translate-x-4 translate-y-4 rounded-full bg-gold/20" aria-hidden="true" />
            <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-gold/30">
              <CoverImage src={imageUrl} alt={title} sizes="(min-width: 1024px) 384px, 80vw" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.15}>
          <SectionHeading eyebrow="نبذة عني" title={title} />
          <p className="text-brown/80 text-lg leading-loose -mt-4 mb-8 whitespace-pre-line">{description}</p>
          <Button href="/about" variant="outline" size="md">
            اعرفي المزيد
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
