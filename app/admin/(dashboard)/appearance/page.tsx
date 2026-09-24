import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { toSiteContent } from "@/lib/site-settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { HomepageForm } from "@/components/admin/settings/HomepageForm";
import { ThemeForm } from "@/components/admin/settings/ThemeForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "الواجهة والمظهر" };

export default async function AppearancePage() {
  const { supabase } = await requireAdminContext();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error("Failed to load settings");
  const content = toSiteContent(data);

  return (
    <>
      <AdminPageHeader
        title="الواجهة والمظهر"
        description="حرّري محتوى الصفحة الرئيسية واختاري ألوان الموقع وخطوطه."
        actions={
          <Button href="/" size="sm" variant="outline">
            <ExternalLink className="h-4 w-4" />
            عرض الموقع
          </Button>
        }
      />
      {/* Both forms stay mounted, so switching tabs keeps unsaved edits. */}
      <SettingsTabs
        tabs={[
          { value: "content", label: "محتوى الصفحة الرئيسية", content: <HomepageForm content={content} /> },
          { value: "theme", label: "الألوان والخطوط", content: <ThemeForm initial={content.theme} /> },
        ]}
      />
    </>
  );
}
