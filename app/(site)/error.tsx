"use client";

import { RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Friendly fallback when content cannot be loaded (e.g. the database is unavailable). */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-navy-fade text-white text-center px-6">
      <div>
        <span className="marginalia text-gold-light mb-4 inline-block">— عذرًا</span>
        <h1 className="font-display text-4xl md:text-5xl mb-4">تعذّر تحميل المحتوى</h1>
        <p className="text-white/70 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          حدثت مشكلة مؤقتة أثناء جلب المحتوى. حاولي مرة أخرى بعد لحظات.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={reset} variant="gold" size="lg">
            <RotateCcw className="h-5 w-5" />
            إعادة المحاولة
          </Button>
          <Button href="/" variant="outline" size="lg" className="border-white/30 text-white hover:border-gold hover:text-gold">
            <Home className="h-5 w-5" />
            الرئيسية
          </Button>
        </div>
      </div>
    </section>
  );
}
