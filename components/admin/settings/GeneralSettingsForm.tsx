"use client";

import { Save } from "lucide-react";
import { saveGeneralSettings, type GeneralSettingsInput } from "@/lib/actions/settings";
import type { SiteContent } from "@/lib/site-settings";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { useSettingsForm } from "./useSettingsForm";

const SOCIAL_FIELDS: { key: keyof GeneralSettingsInput & `${string}_url`; label: string; placeholder: string }[] = [
  { key: "facebook_url", label: "فيسبوك", placeholder: "https://facebook.com/…" },
  { key: "youtube_url", label: "يوتيوب", placeholder: "https://youtube.com/@…" },
  { key: "whatsapp_url", label: "واتساب", placeholder: "https://wa.me/20…" },
  { key: "instagram_url", label: "إنستجرام", placeholder: "https://instagram.com/…" },
  { key: "linkedin_url", label: "لينكدإن", placeholder: "https://linkedin.com/in/…" },
  { key: "github_url", label: "GitHub", placeholder: "https://github.com/…" },
  { key: "behance_url", label: "Behance", placeholder: "https://behance.net/…" },
];

export function GeneralSettingsForm({ content }: { content: SiteContent }) {
  const initial: GeneralSettingsInput = {
    site_name: content.siteName,
    site_description: content.siteDescription,
    contact_email: content.contactEmail,
    facebook_url: content.social.facebook,
    youtube_url: content.social.youtube,
    whatsapp_url: content.social.whatsapp,
    instagram_url: content.social.instagram,
    linkedin_url: content.social.linkedin,
    github_url: content.social.github,
    behance_url: content.social.behance,
  };
  const { values, set, errors, pending, dirty, submit } = useSettingsForm(initial, saveGeneralSettings, "تم حفظ الإعدادات");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5">
        <h2 className="font-display text-2xl text-navy">هوية الموقع</h2>
        <Field id="site_name" label="اسم الموقع" required error={errors.site_name} hint="يظهر في الشعار وعنوان المتصفح ونتائج البحث.">
          <Input {...describedBy("site_name", errors.site_name, "hint")} value={values.site_name} maxLength={120} onChange={(e) => set("site_name", e.target.value)} />
        </Field>
        <Field id="site_description" label="وصف الموقع" error={errors.site_description} hint="يظهر في التذييل ونتائج البحث ومعاينات المشاركة.">
          <Textarea {...describedBy("site_description", errors.site_description, "hint")} rows={3} maxLength={500} value={values.site_description} onChange={(e) => set("site_description", e.target.value)} />
        </Field>
        <Field id="contact_email" label="البريد الإلكتروني للتواصل" error={errors.contact_email} hint="يظهر في صفحة التواصل والتذييل.">
          <Input {...describedBy("contact_email", errors.contact_email, "hint")} type="email" dir="ltr" value={values.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
        </Field>
      </section>

      <section className="rounded-2xl bg-paper p-6 border border-navy/5">
        <h2 className="font-display text-2xl text-navy">روابط التواصل الاجتماعي</h2>
        <p className="font-ui text-sm text-navy/50 mt-1 mb-5">اتركي الحقل فارغًا لإخفاء الأيقونة من الموقع.</p>
        <div className="grid md:grid-cols-2 gap-5">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} id={key} label={label} error={errors[key]}>
              <Input {...describedBy(key, errors[key])} type="url" dir="ltr" placeholder={placeholder} value={values[key]} onChange={(e) => set(key, e.target.value)} />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" loading={pending} disabled={!dirty}>
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
        {dirty && <span className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</span>}
      </div>
    </form>
  );
}
