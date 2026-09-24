import type { Metadata } from "next";
import Link from "next/link";
import { AccountCard } from "@/components/account/AccountCard";
import { LoginForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "تسجيل الدخول", robots: { index: false } };

export default async function AccountLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AccountCard
      title="تسجيل الدخول"
      description="سجّل/ي الدخول للتعليق باسم حسابك."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link href="/account/register" className="text-gold-dark font-semibold hover:underline">
            أنشئ/ي حسابًا
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={error === "confirm" ? "رابط التأكيد غير صالح أو منتهي الصلاحية. سجّل/ي الدخول أو أنشئ/ي حسابًا جديدًا." : undefined} />
    </AccountCard>
  );
}
