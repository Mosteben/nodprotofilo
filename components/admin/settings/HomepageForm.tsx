"use client";

import { Save } from "lucide-react";
import { saveHomepageContent, type HomepageInput } from "@/lib/actions/settings";
import { HOMEPAGE_SECTIONS, type HomepageSection, type SiteContent } from "@/lib/site-settings";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { useSettingsForm } from "./useSettingsForm";

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-paper p-6 border border-navy/5">
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      {description && <p className="font-ui text-sm text-navy/50 mt-1">{description}</p>}
      <div className="space-y-5 mt-5">{children}</div>
    </section>
  );
}

export function HomepageForm({ content }: { content: SiteContent }) {
  const initial: HomepageInput = {
    hero_title: content.heroTitle,
    hero_description: content.heroDescription,
    hero_image_url: content.heroImageUrl,
    homepage: content.homepage,
  };
  const { values, set, errors, pending, dirty, submit } = useSettingsForm(initial, saveHomepageContent, "تم حفظ محتوى الصفحة الرئيسية");
  const home = values.homepage;
  const setHome = <K extends keyof typeof home>(key: K, value: (typeof home)[K]) => set("homepage", { ...home, [key]: value });

  const homeText = (key: "heroEyebrow" | "heroBadge" | "heroButtonText" | "heroButtonUrl" | "heroSecondaryButtonText" | "heroSecondaryButtonUrl" | "quoteAuthor" | "contactTitle", label: string, hint?: string, ltr = false) => {
    const error = errors[`homepage.${key}`];
    return (
      <Field id={key} label={label} hint={hint} error={error}>
        <Input {...describedBy(key, error, hint)} value={home[key]} dir={ltr ? "ltr" : undefined} onChange={(e) => setHome(key, e.target.value)} />
      </Field>
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
      noValidate
    >
      <Panel title="القسم الرئيسي (Hero)" description="أول ما يراه الزائر في الصفحة الرئيسية.">
        {homeText("heroEyebrow", "العبارة الصغيرة فوق العنوان")}
        <Field id="hero_title" label="العنوان" required error={errors.hero_title} hint="كل سطر يظهر في سطر مستقل، والسطر الأخير يُميَّز بخط الحبر الذهبي.">
          <Textarea {...describedBy("hero_title", errors.hero_title, "hint")} rows={2} value={values.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
        </Field>
        <Field id="hero_description" label="الوصف" error={errors.hero_description}>
          <Textarea {...describedBy("hero_description", errors.hero_description)} rows={3} value={values.hero_description} onChange={(e) => set("hero_description", e.target.value)} />
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          {homeText("heroButtonText", "نص الزر الأساسي")}
          {homeText("heroButtonUrl", "رابط الزر الأساسي", "مثل /blog أو https://…", true)}
          {homeText("heroSecondaryButtonText", "نص الزر الثانوي", "اتركيه فارغًا لإخفاء الزر.")}
          {homeText("heroSecondaryButtonUrl", "رابط الزر الثانوي", undefined, true)}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <ImageField id="hero_image" label="صورة القسم الرئيسي" aspect="aspect-[4/5]" value={values.hero_image_url ?? ""} onChange={(url) => set("hero_image_url", url)} error={errors.hero_image_url} />
          <div>{homeText("heroBadge", "الاقتباس العائم بجانب الصورة", "اتركيه فارغًا لإخفائه.")}</div>
        </div>
      </Panel>

      <Panel title="نبذة عني" description="قسم «نبذة عني» في الصفحة الرئيسية يعرض عنوان ونص وصورة صفحة «من أنا».">
        <Button href="/admin/about" size="sm" variant="outline" className="w-fit">
          تحرير محتوى «من أنا»
        </Button>
      </Panel>

      <Panel title="الاقتباس">
        <Field id="quoteText" label="نص الاقتباس" error={errors["homepage.quoteText"]} hint="تُحفظ الأسطر كما تكتبينها.">
          <Textarea {...describedBy("quoteText", errors["homepage.quoteText"], "hint")} rows={6} value={home.quoteText} onChange={(e) => setHome("quoteText", e.target.value)} />
        </Field>
        {homeText("quoteAuthor", "القائل")}
      </Panel>

      <Panel title="دعوة للتواصل" description="قسم في آخر الصفحة الرئيسية يدعو الزائر لمراسلتك.">
        {homeText("contactTitle", "العنوان")}
        <Field id="contactText" label="النص" error={errors["homepage.contactText"]}>
          <Textarea {...describedBy("contactText", errors["homepage.contactText"])} rows={2} value={home.contactText} onChange={(e) => setHome("contactText", e.target.value)} />
        </Field>
      </Panel>

      <Panel title="أقسام الصفحة الرئيسية" description="اختاري الأقسام التي تظهر (المشاريع المميّزة وأحدث المقالات تأتي تلقائيًا من المحتوى المنشور).">
        <div className="grid sm:grid-cols-2 gap-4">
          {(Object.entries(HOMEPAGE_SECTIONS) as [HomepageSection, string][]).map(([key, label]) => (
            <Checkbox
              key={key}
              id={`section-${key}`}
              label={label}
              checked={home.sections[key]}
              onChange={(e) => setHome("sections", { ...home.sections, [key]: e.target.checked })}
            />
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-2xl bg-paper/95 backdrop-blur border border-navy/10 shadow-soft p-4">
        <Button type="submit" size="sm" loading={pending} disabled={!dirty}>
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
        {dirty && <span className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</span>}
      </div>
    </form>
  );
}
