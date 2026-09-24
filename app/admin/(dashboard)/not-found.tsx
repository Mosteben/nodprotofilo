import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="max-w-lg mx-auto mt-16 rounded-2xl bg-paper p-8 text-center shadow-soft">
      <SearchX className="h-12 w-12 text-gold-dark mx-auto mb-4" />
      <h1 className="font-display text-3xl text-navy mb-3">العنصر غير موجود</h1>
      <p className="font-ui text-sm text-navy/70 mb-6">ربما تم حذفه أو أن الرابط غير صحيح.</p>
      <Button href="/admin" size="sm">
        العودة إلى لوحة التحكم
      </Button>
    </div>
  );
}
