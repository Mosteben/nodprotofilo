"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const iconButton =
  "h-8 w-8 rounded-lg flex items-center justify-center text-navy/50 hover:bg-section hover:text-navy disabled:opacity-30";

/** Repeatable group of fields with add / remove / reorder controls. */
export function ListEditor<T>({
  legend,
  description,
  items,
  blank,
  addLabel,
  onChange,
  renderItem,
}: {
  legend: string;
  description?: string;
  items: T[];
  blank: T;
  addLabel: string;
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <fieldset className="rounded-2xl bg-paper p-6 border border-navy/5">
      <legend className="sr-only">{legend}</legend>
      <h2 className="font-display text-2xl text-navy" aria-hidden="true">
        {legend}
      </h2>
      {description && <p className="font-ui text-sm text-navy/50 mt-1">{description}</p>}

      <ol className="space-y-4 mt-5">
        {items.map((item, index) => (
          <li key={index} className="rounded-xl border border-navy/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-ui text-xs text-navy/40">#{index + 1}</span>
              <div className="flex gap-1">
                <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`تحريك العنصر ${index + 1} لأعلى`}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className={iconButton} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`تحريك العنصر ${index + 1} لأسفل`}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" className={`${iconButton} hover:text-red-600`} onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`حذف العنصر ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {renderItem(item, (patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it))), index)}
            </div>
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="font-ui text-sm text-navy/40 mt-4">لا توجد عناصر — هذا القسم لن يظهر في الموقع.</p>}

      <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => onChange([...items, blank])} disabled={items.length >= 40}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </fieldset>
  );
}
