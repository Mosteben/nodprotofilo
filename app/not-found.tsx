import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InkStroke } from "@/components/ui/InkStroke";

export default function NotFound() {
  return (
    <section className="min-h-[75vh] flex items-center justify-center bg-navy-fade text-white text-center px-6">
      <div>
        <span className="marginalia text-gold-light mb-4 inline-block">— صفحة مفقودة</span>
        <h1 className="font-display text-8xl md:text-9xl text-gold mb-4 relative inline-block">
          ٤٠٤
          <InkStroke className="absolute -bottom-4 right-0 w-full h-5" />
        </h1>
        <p className="text-white/70 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          يبدو أن هذه الصفحة غير موجودة، أو أنها انتقلت لمكان آخر. لنعد بك إلى
          الصفحة الرئيسية.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button href="/" variant="gold" size="lg">
            <Home className="h-5 w-5" />
            العودة للرئيسية
          </Button>
          <Button
            href="/articles"
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:border-gold hover:text-gold"
          >
            <Search className="h-5 w-5" />
            تصفّح المقالات
          </Button>
        </div>
      </div>
    </section>
  );
}
