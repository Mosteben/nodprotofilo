import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { toSiteContent } from "@/lib/site-settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { AboutForm } from "@/components/admin/settings/AboutForm";
import { ProfileForm } from "@/components/admin/settings/ProfileForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "من أنا" };

export default async function AdminAboutPage() {
  const { supabase, profile } = await requireAdminContext();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error("Failed to load settings");

  return (
    <>
      <AdminPageHeader
        title="من أنا"
        description="محتوى صفحة «من أنا» وبياناتك الشخصية. روابط التواصل الاجتماعي في «الإعدادات»."
        actions={
          <Button href="/about" size="sm" variant="outline">
            <ExternalLink className="h-4 w-4" />
            عرض الصفحة
          </Button>
        }
      />
      <SettingsTabs
        tabs={[
          { value: "content", label: "محتوى الصفحة", content: <AboutForm content={toSiteContent(data)} /> },
          { value: "profile", label: "الملف الشخصي", content: <ProfileForm profile={profile} /> },
        ]}
      />
    </>
  );
}
