"use client";

import { Save } from "lucide-react";
import { saveAboutContent, type AboutInput } from "@/lib/actions/settings";
import { ABOUT_ICONS, type AboutIcon } from "@/lib/about";
import type { SiteContent } from "@/lib/site-settings";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { ListEditor } from "./ListEditor";
import { useSettingsForm } from "./useSettingsForm";

type About = SiteContent["about"];

export function AboutForm({ content }: { content: SiteContent }) {
  const initial: AboutInput = {
    about_title: content.aboutTitle,
    about_description: content.aboutDescription,
    about: content.about,
  };
  const { values, set, errors, pending, dirty, submit } = useSettingsForm(initial, saveAboutContent, "تم حفظ صفحة «من أنا»");
  const about = values.about as About;
  const setAbout = <K extends keyof About>(key: K, value: About[K]) => set("about", { ...about, [key]: value });

  /** Text input bound to a list item field, with its validation error. */
  const itemInput = (path: string, label: string, value: string, onChange: (v: string) => void, multiline = false) => {
    const error = errors[path];
    const id = path.replace(/\./g, "-");
    return (
      <Field id={id} label={label} error={error}>
        {multiline ? (
          <Textarea {...describedBy(id, error)} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input {...describedBy(id, error)} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
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
      <section className="rounded-2xl bg-paper p-6 border border-navy/5">
        <h2 className="font-display text-2xl text-navy mb-5">المقدمة</h2>
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <ImageField id="about-image" label="الصورة" aspect="aspect-square" value={about.imageUrl} onChange={(url) => setAbout("imageUrl", url)} error={errors["about.imageUrl"]} />
          <div className="space-y-5">
            <Field id="about_title" label="العنوان" error={errors.about_title}>
              <Input {...describedBy("about_title", errors.about_title)} value={values.about_title} onChange={(e) => set("about_title", e.target.value)} />
            </Field>
            <Field id="about_description" label="نبذة قصيرة" error={errors.about_description} hint="تظهر أعلى صفحة «من أنا» وفي قسم «نبذة عني» بالصفحة الرئيسية.">
              <Textarea {...describedBy("about_description", errors.about_description, "hint")} rows={3} value={values.about_description} onChange={(e) => set("about_description", e.target.value)} />
            </Field>
            <Field id="longBio" label="السيرة الكاملة" error={errors["about.longBio"]} hint="اختياري. افصلي بين الفقرات بسطر فارغ.">
              <Textarea {...describedBy("longBio", errors["about.longBio"], "hint")} rows={8} value={about.longBio} onChange={(e) => setAbout("longBio", e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      <ListEditor
        legend="بطاقات التعريف"
        description="البطاقات القصيرة أسفل المقدمة (التعليم، رحلة الكتابة…)."
        items={about.highlights}
        blank={{ icon: "sparkles" as AboutIcon, title: "", text: "" }}
        addLabel="إضافة بطاقة"
        onChange={(items) => setAbout("highlights", items)}
        renderItem={(item, update, i) => (
          <>
            <div className="grid sm:grid-cols-[160px_1fr] gap-4">
              <Field id={`highlight-icon-${i}`} label="الأيقونة">
                <Select id={`highlight-icon-${i}`} value={item.icon} onChange={(e) => update({ icon: e.target.value as AboutIcon })}>
                  {Object.entries(ABOUT_ICONS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              {itemInput(`about.highlights.${i}.title`, "العنوان", item.title, (title) => update({ title }))}
            </div>
            {itemInput(`about.highlights.${i}.text`, "النص", item.text, (text) => update({ text }), true)}
          </>
        )}
      />

      <ListEditor
        legend="المهارات"
        items={about.skills}
        blank={{ label: "", level: 70 }}
        addLabel="إضافة مهارة"
        onChange={(items) => setAbout("skills", items)}
        renderItem={(item, update, i) => (
          <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-end">
            {itemInput(`about.skills.${i}.label`, "المهارة", item.label, (label) => update({ label }))}
            <Field id={`skill-level-${i}`} label={`المستوى: ${item.level}٪`}>
              <input
                id={`skill-level-${i}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={item.level}
                onChange={(e) => update({ level: Number(e.target.value) })}
                className="w-full h-12 accent-[rgb(var(--color-gold-dark))]"
              />
            </Field>
          </div>
        )}
      />

      <ListEditor
        legend="الخبرات والمحطات"
        description="تظهر كخط زمني بعنوان «رحلتي بالتفصيل»."
        items={about.timeline}
        blank={{ year: "", title: "", description: "" }}
        addLabel="إضافة محطة"
        onChange={(items) => setAbout("timeline", items)}
        renderItem={(item, update, i) => (
          <>
            <div className="grid sm:grid-cols-[140px_1fr] gap-4">
              {itemInput(`about.timeline.${i}.year`, "السنة / الفترة", item.year, (year) => update({ year }))}
              {itemInput(`about.timeline.${i}.title`, "العنوان", item.title, (title) => update({ title }))}
            </div>
            {itemInput(`about.timeline.${i}.description`, "الوصف", item.description, (description) => update({ description }), true)}
          </>
        )}
      />

      <ListEditor
        legend="التعليم"
        items={about.education}
        blank={{ period: "", title: "", description: "" }}
        addLabel="إضافة مؤهل"
        onChange={(items) => setAbout("education", items)}
        renderItem={(item, update, i) => (
          <>
            <div className="grid sm:grid-cols-[140px_1fr] gap-4">
              {itemInput(`about.education.${i}.period`, "الفترة", item.period, (period) => update({ period }))}
              {itemInput(`about.education.${i}.title`, "المؤهل / الجهة", item.title, (title) => update({ title }))}
            </div>
            {itemInput(`about.education.${i}.description`, "تفاصيل", item.description, (description) => update({ description }), true)}
          </>
        )}
      />

      {(["achievements", "services"] as const).map((key) => (
        <ListEditor
          key={key}
          legend={key === "achievements" ? "الإنجازات" : "الخدمات"}
          items={about[key]}
          blank={{ title: "", description: "" }}
          addLabel={key === "achievements" ? "إضافة إنجاز" : "إضافة خدمة"}
          onChange={(items) => setAbout(key, items)}
          renderItem={(item, update, i) => (
            <>
              {itemInput(`about.${key}.${i}.title`, "العنوان", item.title, (title) => update({ title }))}
              {itemInput(`about.${key}.${i}.description`, "الوصف", item.description, (description) => update({ description }), true)}
            </>
          )}
        />
      ))}

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
