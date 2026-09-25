"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { htmlToText, countWords } from "@/lib/text";
import { readingTime, cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";

/** Rich-text editor with an Edit/Preview switch and a live word count. */
export function ContentEditor({
  value,
  onChange,
  error,
  previewTitle,
  previewLead,
}: {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  previewTitle: string;
  previewLead?: string;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const words = useMemo(() => countWords(htmlToText(value)), [value]);

  return (
    <div className="rounded-2xl bg-paper p-4 sm:p-6 border border-navy/5 min-w-0">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div role="tablist" aria-label="وضع المحرر" className="inline-flex rounded-full bg-section p-1">
          {(
            [
              { key: "edit", label: "تحرير", icon: PencilLine },
              { key: "preview", label: "معاينة", icon: Eye },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 font-ui text-sm transition-colors",
                tab === key ? "bg-navy text-white" : "text-navy/70 hover:text-navy"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <span className="font-ui text-xs text-navy/50">
          {words} كلمة · {readingTime(words)} دقائق قراءة
        </span>
      </div>

      <label htmlFor="content" className="sr-only">
        المحتوى
      </label>
      {/* Kept mounted while previewing so undo history survives switching tabs. */}
      <div hidden={tab !== "edit"}>
        <RichTextEditor id="content" value={value} onChange={onChange} invalid={Boolean(error)} />
      </div>
      {tab === "preview" && (
        <article className="rounded-xl border border-navy/10 px-5 py-8 min-h-[360px]">
          <h1 className="font-display text-3xl md:text-4xl text-navy mb-4">{previewTitle || "بدون عنوان"}</h1>
          {previewLead && <p className="text-lg text-ink/90 font-medium mb-6">{previewLead}</p>}
          {/* Tiptap output is schema-constrained; it is sanitised again on save. */}
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: value || "<p>لا يوجد محتوى بعد.</p>" }} />
        </article>
      )}
      {error && <p className="font-ui text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
