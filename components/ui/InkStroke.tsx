"use client";

import { motion } from "framer-motion";

/**
 * The site's signature element: a single continuous ink stroke that draws
 * itself, echoing a pen underlining the important word — the way a writer
 * marks her own manuscript. Animated once, on the hero. Reused statically
 * (no re-animation) elsewhere to keep the motion budget disciplined.
 */
export function InkStroke({
  className,
  animate = true,
  delay = 0.6,
}: {
  className?: string;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 300 20"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M2 14C48 6 96 4 150 8C204 12 252 6 298 10"
        stroke="#D4AF37"
        strokeWidth="4"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        whileInView={animate ? { pathLength: 1, opacity: 1 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay, ease: "easeInOut" }}
      />
    </svg>
  );
}
