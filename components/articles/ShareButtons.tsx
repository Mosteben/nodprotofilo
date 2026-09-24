"use client";

import { Facebook, Link2, Twitter, Send } from "lucide-react";
import { useState } from "react";

const shareLink =
  "h-9 w-9 flex items-center justify-center rounded-full bg-section hover:bg-gold hover:text-navy transition-colors";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing else to do.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-ui text-sm text-navy/60">شارك:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`شارك "${title}" على فيسبوك`}
        className={shareLink}
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`شارك "${title}" على إكس`}
        className={shareLink}
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`شارك "${title}" على واتساب`}
        className={shareLink}
      >
        <Send className="h-4 w-4" />
      </a>
      <button type="button" onClick={handleCopy} aria-label="نسخ الرابط" className={`${shareLink} relative`}>
        <Link2 className="h-4 w-4" />
        <span role="status" className={copied ? "absolute -top-8 right-1/2 translate-x-1/2 text-xs bg-navy text-white px-2 py-1 rounded whitespace-nowrap" : "sr-only"}>
          {copied ? "تم النسخ" : ""}
        </span>
      </button>
    </div>
  );
}
