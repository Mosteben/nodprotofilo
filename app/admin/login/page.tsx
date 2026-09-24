import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, AlertTriangle } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-navy-fade flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 text-white">
          <PenLine className="h-7 w-7 text-gold" />
          <span className="font-display text-3xl">{SITE.name}</span>
        </Link>

        <div className="rounded-2xl bg-paper p-8 shadow-soft">
          <h1 className="font-display text-3xl text-navy mb-2">لوحة التحكم</h1>
          <p className="font-ui text-sm text-navy/60 mb-8">سجّلي الدخول لإدارة محتوى الموقع.</p>

          {!configured && (
            <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 font-ui text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                لم يتم ربط Supabase بعد. أضيفي <code dir="ltr">NEXT_PUBLIC_SUPABASE_URL</code> و
                <code dir="ltr"> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> كما هو موضّح في README.
              </p>
            </div>
          )}

          <LoginForm next={next} />
        </div>

        <p className="text-center mt-6 font-ui text-sm">
          <Link href="/" className="text-white/70 hover:text-gold transition-colors">
            العودة إلى الموقع
          </Link>
        </p>
      </div>
    </main>
  );
}
