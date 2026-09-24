"use client";

import { Save } from "lucide-react";
import { saveProfile, type ProfileInput } from "@/lib/actions/settings";
import type { ProfileRow } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { useSettingsForm } from "./useSettingsForm";

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const initial: ProfileInput = {
    name: profile.name ?? "",
    bio: profile.bio ?? "",
    avatar_url: profile.avatar_url ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
  };
  const { values, set, errors, pending, dirty, submit } = useSettingsForm(initial, saveProfile, "تم حفظ الملف الشخصي");

  const input = (key: "name" | "email" | "phone" | "location" | "website", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <Field id={`profile-${key}`} label={label} error={errors[key]} hint={hint}>
      <Input {...describedBy(`profile-${key}`, errors[key], hint)} value={values[key]} onChange={(e) => set(key, e.target.value)} {...props} />
    </Field>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-2xl bg-paper p-6 border border-navy/5"
      noValidate
    >
      <h2 className="font-display text-2xl text-navy">الملف الشخصي</h2>
      <p className="font-ui text-sm text-navy/50 mt-1 mb-5">
        الاسم والنبذة والصورة والمدينة والموقع قد تظهر للزوار. البريد والهاتف يبقيان خاصَّين بلوحة التحكم.
      </p>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <ImageField id="avatar" label="الصورة الشخصية" aspect="aspect-square" value={values.avatar_url ?? ""} onChange={(url) => set("avatar_url", url)} error={errors.avatar_url} />
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {input("name", "الاسم", { maxLength: 120 })}
            {input("location", "المدينة / البلد", { maxLength: 120 })}
            {input("email", "البريد الإلكتروني", { type: "email", dir: "ltr" })}
            {input("phone", "رقم الهاتف", { type: "tel", dir: "ltr", maxLength: 40 })}
          </div>
          {input("website", "الموقع الشخصي", { type: "url", dir: "ltr", placeholder: "https://…" })}
          <Field id="profile-bio" label="نبذة قصيرة" error={errors.bio}>
            <Textarea {...describedBy("profile-bio", errors.bio)} rows={4} maxLength={2000} value={values.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
          </Field>
          <div className="flex items-center gap-4">
            <Button type="submit" size="sm" loading={pending} disabled={!dirty}>
              <Save className="h-4 w-4" />
              حفظ الملف الشخصي
            </Button>
            {dirty && <span className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</span>}
          </div>
        </div>
      </div>
    </form>
  );
}
