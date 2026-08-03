"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import type { GalleryImage } from "@/types";

export function MasonryGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className="mb-4 block w-full break-inside-avoid rounded-2xl overflow-hidden relative group focus-visible:outline-gold"
            style={{ aspectRatio: i % 3 === 0 ? "3/4" : "4/5" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(min-width:768px) 33vw, 50vw"
            />
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/30 transition-colors" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/95 flex items-center justify-center p-6"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="إغلاق"
              className="absolute top-6 left-6 text-white/70 hover:text-gold"
            >
              <X className="h-7 w-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="السابق"
              className="absolute right-6 text-white/70 hover:text-gold"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="التالي"
              className="absolute left-6 text-white/70 hover:text-gold"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <motion.div
              key={activeIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-[4/5]"
            >
              <Image src={images[activeIndex].src} alt={images[activeIndex].alt} fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
