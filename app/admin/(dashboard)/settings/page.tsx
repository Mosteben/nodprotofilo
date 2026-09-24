import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { toSiteContent } from "@/lib/site-settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { ProfileForm } from "@/components/admin/settings/ProfileForm";

export const metadata: Metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const { supabase, profile } = await requireAdminContext();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error("Failed to load settings");

  return (
    <>
      <AdminPageHeader title="الإعدادات" description="بيانات الموقع العامة وروابط التواصل وملفك الشخصي." />
      <SettingsTabs
        tabs={[
          { value: "general", label: "إعدادات الموقع", content: <GeneralSettingsForm content={toSiteContent(data)} /> },
          { value: "profile", label: "الملف الشخصي", content: <ProfileForm profile={profile} /> },
        ]}
      />
    </>
  );
}
