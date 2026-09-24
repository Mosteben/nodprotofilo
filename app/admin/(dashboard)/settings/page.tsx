import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { toSiteContent } from "@/lib/site-settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";

export const metadata: Metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminContext();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error("Failed to load settings");

  return (
    <>
      <AdminPageHeader
        title="الإعدادات"
        description="بيانات الموقع العامة وروابط التواصل. الملف الشخصي ومحتوى «من أنا» في صفحة «من أنا»."
      />
      <GeneralSettingsForm content={toSiteContent(data)} />
    </>
  );
}
