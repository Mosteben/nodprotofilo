"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Shown when an admin page fails to load (e.g. the database is unreachable). */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto mt-16 rounded-2xl bg-paper p-8 text-center shadow-soft">
      <AlertTriangle className="h-12 w-12 text-gold-dark mx-auto mb-4" />
      <h1 className="font-display text-3xl text-navy mb-3">تعذّر تحميل الصفحة</h1>
      <p className="font-ui text-sm text-navy/70 leading-relaxed mb-6">
        قد تكون قاعدة البيانات غير متاحة مؤقتًا أو أن الاتصال بالإنترنت ضعيف. حاولي مرة أخرى.
      </p>
      <Button onClick={reset} size="sm">
        <RotateCcw className="h-4 w-4" />
        إعادة المحاولة
      </Button>
    </div>
  );
}
