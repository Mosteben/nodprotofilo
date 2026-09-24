import Image, { type ImageProps } from "next/image";
import { PenLine } from "lucide-react";
import { isOptimizableImage } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * next/image for CMS-provided URLs (fill mode). Falls back to a branded placeholder when
 * there is no image, and skips optimisation for hosts next.config does not allow.
 */
export function CoverImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImageProps, "src" | "alt" | "fill"> & { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0 bg-navy-fade flex items-center justify-center", className)} aria-hidden="true">
        <PenLine className="h-10 w-10 text-gold/60" />
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill unoptimized={!isOptimizableImage(src)} className={cn("object-cover", className)} {...props} />
  );
}
