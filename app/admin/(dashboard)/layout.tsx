import { redirect } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { getAdminStatus } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/constants/site";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const status = await getAdminStatus();

  if (status.status === "unconfigured" || status.status === "signed-out") {
    redirect("/admin/login");
  }

  if (status.status === "forbidden") {
    return (
      <main className="min-h-screen bg-section flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-paper p-8 text-center shadow-soft">
          <ShieldAlert className="h-12 w-12 text-gold-dark mx-auto mb-4" />
          <h1 className="font-display text-3xl text-navy mb-3">غير مصرّح بالدخول</h1>
          <p className="font-ui text-sm text-navy/70 leading-relaxed mb-6">
            الحساب <span dir="ltr" className="font-semibold">{status.email}</span> ليس لديه صلاحية
            الإدارة. إن كنتِ صاحبة الموقع، اتبعي خطوة «إعداد حساب المدير» في README.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </main>
    );
  }

  const [{ count: unread }, { count: pending }, { data: settings }] = await Promise.all([
    status.supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    status.supabase.from("comments").select("id", { count: "exact", head: true }).eq("is_approved", false),
    status.supabase.from("site_settings").select("site_name").eq("id", 1).maybeSingle(),
  ]);

  return (
    <div className="min-h-screen bg-section lg:flex">
      <AdminSidebar
        badges={{ messages: unread ?? 0, comments: pending ?? 0 }}
        email={status.user.email ?? ""}
        siteName={settings?.site_name || SITE.name}
      />
      <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
