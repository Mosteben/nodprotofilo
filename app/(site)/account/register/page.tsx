import type { Metadata } from "next";
import Link from "next/link";
import { AccountCard } from "@/components/account/AccountCard";
import { RegisterForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AccountCard
      title="إنشاء حساب"
      description="حساب مجاني للتعليق على المقالات والكتب والمحاضرات."
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link href="/account/login" className="text-gold-dark font-semibold hover:underline">
            سجّل/ي الدخول
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AccountCard>
  );
}
