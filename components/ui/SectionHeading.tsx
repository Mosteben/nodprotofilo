import { cn } from "@/lib/utils";
import { InkStroke } from "./InkStroke";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 mb-12",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <span className="marginalia">— {eyebrow}</span>}
      <h2 className="text-3xl md:text-4xl font-bold text-navy relative inline-block w-fit">
        {title}
        <InkStroke animate={false} className="absolute -bottom-2 right-0 w-24 h-3" />
      </h2>
      {description && (
        <p className="text-brown/80 font-body max-w-2xl text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
