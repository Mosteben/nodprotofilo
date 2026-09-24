"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, RotateCcw, Save } from "lucide-react";
import { saveTheme } from "@/lib/actions/settings";
import {
  ACCENT_PALETTES,
  BACKGROUNDS,
  BODY_FONTS,
  BUTTON_STYLES,
  CARD_RADII,
  DEFAULT_THEME,
  HEADING_FONTS,
  PRIMARY_PALETTES,
  TEXT_COLORS,
  themeVars,
  type ThemeSettings,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useUnsavedChangesWarning } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";

type Option = { label: string; swatch?: string; variable?: string; radius?: string };

function OptionGroup<K extends keyof ThemeSettings>({
  name,
  legend,
  options,
  value,
  onChange,
  kind,
}: {
  name: K;
  legend: string;
  options: Record<string, Option>;
  value: string;
  onChange: (key: K, value: ThemeSettings[K]) => void;
  kind: "swatch" | "font" | "shape";
}) {
  return (
    <fieldset>
      <legend className="font-ui text-sm font-medium text-navy mb-3">{legend}</legend>
      <div className={cn("grid gap-2", kind === "swatch" ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-1 sm:grid-cols-2")}>
        {Object.entries(options).map(([key, option]) => {
          const selected = value === key;
          return (
            <label
              key={key}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                selected ? "border-navy bg-navy/5" : "border-navy/10 hover:border-gold",
                kind === "swatch" && "flex-col text-center"
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={selected}
                onChange={() => onChange(name, key as ThemeSettings[K])}
                className="sr-only"
              />
              {kind === "swatch" && (
                <span className="h-10 w-10 rounded-full border border-black/10 shadow-inner" style={{ background: option.swatch }} aria-hidden="true" />
              )}
              {kind === "shape" && (
                <span className="h-8 w-14 bg-navy shrink-0" style={{ borderRadius: option.radius }} aria-hidden="true" />
              )}
              <span className="font-ui text-xs text-navy">
                {kind === "font" ? (
                  <>
                    <span className="block text-lg leading-snug" style={{ fontFamily: `var(${option.variable})` }}>
                      أبجد هوز حطي
                    </span>
                    <span className="text-navy/50">{option.label}</span>
                  </>
                ) : (
                  option.label
                )}
              </span>
              {selected && <Check className="absolute top-2 left-2 h-4 w-4 text-navy" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Mini page rendered with the unsaved theme so choices can be judged before saving. */
function ThemePreview({ theme }: { theme: ThemeSettings }) {
  return (
    <div style={themeVars(theme) as React.CSSProperties} className="rounded-2xl overflow-hidden border border-navy/10 bg-paper text-ink font-body">
      <div className="bg-navy-fade text-white p-6">
        <span className="font-display text-gold-light text-lg">— معاينة</span>
        <h3 className="font-display text-3xl mt-2">عنوان تجريبي</h3>
        <p className="text-white/75 text-sm mt-2">هكذا سيظهر القسم الرئيسي بالألوان والخطوط المختارة.</p>
        <div className="flex gap-2 mt-4">
          <span className="inline-flex h-9 items-center px-4 rounded-btn bg-gold text-navy font-ui text-sm">زر رئيسي</span>
          <span className="inline-flex h-9 items-center px-4 rounded-btn border border-white/30 font-ui text-sm">زر ثانوي</span>
        </div>
      </div>
      <div className="p-6 bg-section">
        <div className="rounded-2xl bg-paper border border-navy/10 p-5">
          <span className="inline-block bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full mb-3">تصنيف</span>
          <h4 className="font-display text-xl text-navy mb-1">بطاقة مقالة</h4>
          <p className="text-brown/80 text-sm leading-relaxed">نص وصفي قصير بلون النص الثانوي، مع <span className="text-gold-dark">رابط مميّز</span>.</p>
        </div>
      </div>
    </div>
  );
}

export function ThemeForm({ initial }: { initial: ThemeSettings }) {
  const router = useRouter();
  const [theme, setTheme] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);
  useUnsavedChangesWarning(dirty);

  const set = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => setTheme((t) => ({ ...t, [key]: value }));

  function submit() {
    startTransition(async () => {
      const result = await saveTheme(theme);
      if (!result.ok) return void toast.error(result.error);
      setSaved(theme);
      toast.success("تم حفظ المظهر — سيظهر في الموقع فورًا.");
      router.refresh();
    });
  }

  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
      <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-8">
        <OptionGroup name="primary" legend="اللون الأساسي" options={PRIMARY_PALETTES} value={theme.primary} onChange={set} kind="swatch" />
        <OptionGroup name="accent" legend="اللون الثانوي (التمييز)" options={ACCENT_PALETTES} value={theme.accent} onChange={set} kind="swatch" />
        <OptionGroup name="background" legend="لون الخلفية" options={BACKGROUNDS} value={theme.background} onChange={set} kind="swatch" />
        <OptionGroup name="text" legend="لون النص" options={TEXT_COLORS} value={theme.text} onChange={set} kind="swatch" />
        <OptionGroup name="headingFont" legend="خط العناوين" options={HEADING_FONTS} value={theme.headingFont} onChange={set} kind="font" />
        <OptionGroup name="bodyFont" legend="خط النصوص" options={BODY_FONTS} value={theme.bodyFont} onChange={set} kind="font" />
        <OptionGroup name="buttonStyle" legend="شكل الأزرار" options={BUTTON_STYLES} value={theme.buttonStyle} onChange={set} kind="shape" />
        <OptionGroup name="radius" legend="استدارة البطاقات" options={CARD_RADII} value={theme.radius} onChange={set} kind="shape" />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <ThemePreview theme={theme} />
        {dirty && <p className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</p>}
        <div className="flex flex-wrap gap-3">
          <Button size="sm" loading={pending} disabled={!dirty} onClick={submit}>
            <Save className="h-4 w-4" />
            حفظ المظهر
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setTheme(DEFAULT_THEME)}>
            <RotateCcw className="h-4 w-4" />
            استعادة الافتراضي
          </Button>
        </div>
      </aside>
    </div>
  );
}
