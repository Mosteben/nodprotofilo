"use client";

import { Facebook, Link2, Twitter } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex items-center gap-3">
      <span className="font-ui text-sm text-navy/60">شارك المقالة:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`شارك "${title}" على فيسبوك`}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-section hover:bg-gold hover:text-navy transition-colors"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`شارك "${title}" على تويتر`}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-section hover:bg-gold hover:text-navy transition-colors"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopy}
        aria-label="نسخ الرابط"
        className="h-9 w-9 flex items-center justify-center rounded-full bg-section hover:bg-gold hover:text-navy transition-colors relative"
      >
        <Link2 className="h-4 w-4" />
        {copied && (
          <span className="absolute -top-8 right-1/2 translate-x-1/2 text-xs bg-navy text-white px-2 py-1 rounded whitespace-nowrap">
            تم النسخ
          </span>
        )}
      </button>
    </div>
  );
}
