import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAccount } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";
import { AccountNameForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "حسابي", robots: { index: false } };

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: profile } = await supabase.from("profiles").select("name, is_admin").eq("user_id", user.id).maybeSingle();

  return (
    <section className="section-py bg-section">
      <div className="container max-w-xl space-y-6">
        <div className="rounded-2xl bg-paper p-8 shadow-soft">
          <span className="marginalia">— حسابي</span>
          <h1 className="font-display text-3xl text-navy mt-2 mb-1">{profile?.name || "مرحبًا بك"}</h1>
          <p className="font-ui text-sm text-navy/60 mb-8" dir="ltr">
            {user.email}
          </p>
          <AccountNameForm name={profile?.name ?? ""} />
        </div>

        <div className="rounded-2xl bg-paper p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <p className="font-ui text-sm text-navy/60">تعليقاتك تظهر بعد مراجعتها. يمكنك النشر باسمك أو بشكل مجهول.</p>
          <div className="flex gap-3">
            {profile?.is_admin && (
              <Button href="/admin" size="sm" variant="outline">
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </Button>
            )}
            <form action={signOutAccount}>
              <Button type="submit" size="sm" variant="ghost" className="text-red-600">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
