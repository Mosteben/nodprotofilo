import Link from "next/link";
import { PenLine } from "lucide-react";

/** Centered card used by the visitor login/register pages. */
export function AccountCard({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <section className="section-py bg-section">
      <div className="container max-w-md">
        <div className="rounded-2xl bg-paper p-8 shadow-soft">
          <Link href="/" aria-label="الصفحة الرئيسية" className="flex items-center gap-2 mb-6 text-navy w-fit">
            <PenLine className="h-6 w-6 text-gold-dark" />
          </Link>
          <h1 className="font-display text-3xl text-navy mb-2">{title}</h1>
          <p className="font-ui text-sm text-navy/60 mb-8">{description}</p>
          {children}
        </div>
        <p className="text-center mt-6 font-ui text-sm text-navy/70">{footer}</p>
      </div>
    </section>
  );
}
