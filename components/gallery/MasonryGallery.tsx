"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { isOptimizableImage } from "@/lib/images";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  title: string | null;
  caption: string | null;
  category: string | null;
};

const ALL = "الكل";

export function MasonryGallery({ images }: { images: GalleryImage[] }) {
  const [category, setCategory] = useState(ALL);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(images.map((i) => i.category).filter((c): c is string => Boolean(c))))],
    [images]
  );
  const visible = category === ALL ? images : images.filter((i) => i.category === category);
  const active = activeIndex === null ? null : visible[activeIndex];

  const close = () => setActiveIndex(null);
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % visible.length));
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + visible.length) % visible.length));

  // Keyboard support for the lightbox (RTL: ArrowLeft = next).
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      {categories.length > 2 && (
        <div className="flex gap-2 flex-wrap justify-center mb-10" role="group" aria-label="تصفية حسب التصنيف">
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

      <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        {visible.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`عرض الصورة: ${img.title || img.alt}`}
            className="mb-4 block w-full break-inside-avoid rounded-2xl overflow-hidden relative group focus-visible:outline-gold"
            style={{ aspectRatio: i % 3 === 0 ? "3/4" : "4/5" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i < 2}
              unoptimized={!isOptimizableImage(img.src)}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(min-width:768px) 33vw, 50vw"
            />
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/30 transition-colors" />
            {img.title && (
              <span className="absolute bottom-0 inset-x-0 p-3 text-start text-white font-ui text-sm bg-gradient-to-t from-navy/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {img.title}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={active.title || active.alt}
            className="fixed inset-0 z-[100] bg-navy/95 flex items-center justify-center p-6"
            onClick={close}
          >
            <button onClick={close} aria-label="إغلاق" className="absolute top-6 left-6 text-white/70 hover:text-gold">
              <X className="h-7 w-7" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="السابق" className="absolute right-6 text-white/70 hover:text-gold">
              <ChevronRight className="h-8 w-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="التالي" className="absolute left-6 text-white/70 hover:text-gold">
              <ChevronLeft className="h-8 w-8" />
            </button>

            <motion.figure
              key={active.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="relative w-full aspect-[4/5]">
                <Image src={active.src} alt={active.alt} fill unoptimized={!isOptimizableImage(active.src)} className="object-contain" sizes="(min-width: 768px) 672px, 100vw" />
              </div>
              {(active.title || active.caption) && (
                <figcaption className="text-center text-white mt-4">
                  {active.title && <p className="font-display text-2xl">{active.title}</p>}
                  {active.caption && <p className="font-ui text-sm text-white/70 mt-1">{active.caption}</p>}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
