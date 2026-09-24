"use client";

import * as Tabs from "@radix-ui/react-tabs";

const tabClass =
  "px-5 py-2.5 rounded-full font-ui text-sm text-navy/70 data-[state=active]:bg-navy data-[state=active]:text-white transition-colors";

/** Pill-style tabs used by the appearance and settings pages. */
export function SettingsTabs({ tabs }: { tabs: { value: string; label: string; content: React.ReactNode }[] }) {
  return (
    <Tabs.Root defaultValue={tabs[0].value} dir="rtl">
      <Tabs.List aria-label="الأقسام" className="inline-flex flex-wrap rounded-full bg-paper border border-navy/5 p-1 mb-6">
        {tabs.map((t) => (
          <Tabs.Trigger key={t.value} value={t.value} className={tabClass}>
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content key={t.value} value={t.value} forceMount className="data-[state=inactive]:hidden">
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
